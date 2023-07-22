
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Fetch the default VPC information from your AWS account:
const vpc = new awsx.ec2.DefaultVpc("default-vpc");

// Create IAM role and instance profile for the EC2 instance
const ecsInstanceRole = new aws.iam.Role("ecs-instance-role", {
  assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
          {
              Action: "sts:AssumeRole",
              Principal: { Service: "ec2.amazonaws.com" },
              Effect: "Allow",
          },
      ],
  }),
});

new aws.iam.RolePolicyAttachment("ecs-instance-role-attachment", {
  role: ecsInstanceRole.name,
  policyArn: aws.iam.ManagedPolicies.AmazonEC2ContainerServiceforEC2Role,
});

const ecsInstanceProfile = new aws.iam.InstanceProfile("ecs-instance-role", {
  role: ecsInstanceRole.name,
});

const ecsCluster = new aws.ecs.Cluster("ecs-cluster", {});

// Userdata script to pass cluster information to instances
const userdata = pulumi.interpolate `#!/bin/bash
echo ECS_CLUSTER=${ecsCluster.name} >> /etc/ecs/ecs.config;
`.apply((input) => Buffer.from(input).toString("base64"));


const foobar = new aws.ec2.LaunchTemplate("foobar", {
  namePrefix: "foobar",
  imageId: aws.ec2.getAmi({
    owners: ["amazon"],
    mostRecent: true,
    filters: [
        { name: "name", values: ["amzn2-ami-ecs-*"] },
        { name: "architecture", values: ["x86_64"] },
        { name: "virtualization-type", values: ["hvm"] },
    ],
}).then((ami) => ami.id),
  instanceType: "t2.micro",
  iamInstanceProfile: {
    arn: ecsInstanceProfile.arn,
  },
  userData: userdata
});

const autoscalingGroup = new aws.autoscaling.Group("my-autoscaling-group", {
  maxSize: 1,
  minSize: 1,
  desiredCapacity: 1,
  protectFromScaleIn: true,
  launchTemplate: {
    id: foobar.id,
    version: "$Latest"
  },
  // You need to specify new inbound rule in default security group to allow all traffic from port that backend is running on (ex. 8080)
  vpcZoneIdentifiers: vpc.publicSubnetIds,
  tags: [{
    key: "AmazonECSManaged",
    value: "true",
    propagateAtLaunch: true,
  }],
});

const capacityProvider = new aws.ecs.CapacityProvider("my-ecs-capacity-provider", {
  autoScalingGroupProvider: {
      autoScalingGroupArn: autoscalingGroup.arn,
      managedScaling: {
          status: "ENABLED",
          targetCapacity: 10,
      },
      managedTerminationProtection: 'ENABLED',
  },
});

// Set the capacity providers for the cluster
new aws.ecs.ClusterCapacityProviders("my-ecs-cluster-capacity-providers", {
  clusterName: ecsCluster.name,
  capacityProviders: [capacityProvider.name],
});

const taskExecutionRole = new aws.iam.Role("taskExecutionRole", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(
    aws.iam.Principals.EcsTasksPrincipal,
  ),
});

const taskExecutionRolePolicy = new aws.iam.RolePolicy("taskExecutionRolePolicy", {
  role: taskExecutionRole.id,
  policy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource: "*"
      },
    ],
  },
});

const documentDbSubnetGroup = new aws.docdb.SubnetGroup("documentdb-subnet-group", {
    subnetIds: vpc.publicSubnetIds,
});

const mongoUsername: string = "dyno";
const mongoPassword: string = "dynodyno123"

const clusterParameterGroup = new aws.docdb.ClusterParameterGroup("cluster-parameter-group", {
  description: "docdb cluster parameter group",
  family: "docdb4.0",
  parameters: [{
      name: "tls",
      value: "disabled",
  }],
});

const documentDbCluster = new aws.docdb.Cluster("documentdb-cluster", {
    clusterIdentifier: "my-documentdb-cluster",
    engine: "docdb",
    engineVersion: "4.0.0",
    masterUsername: mongoUsername,
    masterPassword: mongoPassword,
    applyImmediately: true,
    skipFinalSnapshot: true,
    dbSubnetGroupName: documentDbSubnetGroup.name,
    backupRetentionPeriod: 7,
    dbClusterParameterGroupName: clusterParameterGroup.name,
});

const myDocDBInstance = new aws.docdb.ClusterInstance("myDocDBInstance", {
    clusterIdentifier: documentDbCluster.id,
    instanceClass: "db.t3.medium",
  });

const containerDefinitions = pulumi.all([documentDbCluster.endpoint]).apply(([endpoint]) => JSON.stringify([
  {
    name: "backend",
    image: "ghcr.io/pr0tex/backend:latest",
    essential: true,
    portMappings: [{
      containerPort: 8080,
      hostPort: 8080,
      protocol: "tcp",
    }],
    environment: [
      { name: "SPRING_DATA_MONGODB_HOST", value: endpoint },
      { name: "SPRING_DATA_MONGODB_PORT", value: "27017" },
      { name: "SPRING_DATA_MONGODB_USERNAME", value: mongoUsername },
      { name: "SPRING_DATA_MONGODB_PASSWORD", value: mongoPassword },
    ],
  },
]));

const taskDefinition = new aws.ecs.TaskDefinition("myTask", {
    family: "my-task",
    cpu: "256",
    memory: "512",
    taskRoleArn: taskExecutionRole.arn,
    executionRoleArn: taskExecutionRole.arn,
    requiresCompatibilities: ["EC2"],
    networkMode: "host",
    containerDefinitions: containerDefinitions
});

const elb = new aws.elb.LoadBalancer("myLoadBalancer", {
  subnets: vpc.publicSubnetIds,
  listeners: [
      {
          instancePort: 8080,
          instanceProtocol: "http",
          lbPort: 8080,
          lbProtocol: "http",
      },
  ],
});

const ecsService = new aws.ecs.Service("myService", {
    name: "my-service",
    cluster: ecsCluster.id,
    taskDefinition: taskDefinition.arn,
    desiredCount: 1,
    launchType: "EC2",
    loadBalancers: [
      {
          containerName: "backend",
          containerPort: 8080,
          elbName: elb.name,
      },
  ],
});

export const loadBalancerUrl = elb.dnsName;


// Create an S3 bucket to store the web application zip file
const bucket = new aws.s3.Bucket("my-bucket");

// Upload the web application zip file to the S3 bucket
const webAppDocker = new aws.s3.BucketObject("Dockerrun.aws.json", {
    bucket: bucket.id,
    key: "Dockerrun.aws.json",
    source: new pulumi.asset.FileAsset("Dockerrun.aws.json"),
});

const ebRole = new aws.iam.Role("ebRole", {assumeRolePolicy: JSON.stringify({
  Version: "2012-10-17",
  Statement: [{
      Action: "sts:AssumeRole",
      Effect: "Allow",
      Sid: "",
      Principal: {
          Service: "elasticbeanstalk.amazonaws.com",
      },
  }],
})});

// Create an Elastic Beanstalk application
const app = new aws.elasticbeanstalk.Application("my-app", {
  description: "my application",
  appversionLifecycle: {
    serviceRole: ebRole.arn,
    maxCount: 128,
    deleteSourceFromS3: true,
  },
});

// Create an Elastic Beanstalk application version using the web application zip file from S3
const version = new aws.elasticbeanstalk.ApplicationVersion("my-version", {
    application: app,
    bucket: bucket.id,
    key: webAppDocker.id,
});

const instanceProfileRole = new aws.iam.Role("eb-ec2-role", {
  name: "eb-ec2-role",
  description: "Role for EC2 managed by EB",
  assumeRolePolicy: JSON.stringify({
    Version: "2008-10-17",
    Statement: [
      {
        Effect: "Allow",        
        Principal: {
          Service: "ec2.amazonaws.com"
        },
        Action: "sts:AssumeRole",        
      }
    ]
  })
});

const rolePolicyAttachment_web = new aws.iam.RolePolicyAttachment(
  `role-policy-attachment-web`,
  {
    role: instanceProfileRole.name,
    policyArn: "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
  }
);

const rolePolicyAttachment_worker = new aws.iam.RolePolicyAttachment(
  `role-policy-attachment-worker`,
  {
    role: instanceProfileRole.name,
    policyArn: "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
  }
);

const rolePolicyMulticontainer_docker = new aws.iam.RolePolicyAttachment(
  `role-policy-multicontainer-docker`,
  {
    role: instanceProfileRole.name,
    policyArn: "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker"
  }
);

const instanceProfile = new aws.iam.InstanceProfile("eb-ec2-role", {
  name: "eb-ec2-role",
  role: instanceProfileRole.name,
});

const ServiceRole = new aws.iam.Role("eb-service-role", {
  name: "eb-service-role",
  description: "Role trusted by Elastic Beanstalk",
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",        
        Principal: {
          Service: "elasticbeanstalk.amazonaws.com"
        },
        Action: "sts:AssumeRole",
        Condition: {
          StringEquals: {
            "sts:ExternalId": "elasticbeanstalk"
          }
        }        
        
      }
    ]
  })
});

const rolePolicyAttachment_ebHealth = new aws.iam.RolePolicyAttachment(
  "role-policy-eb-enhance-health",
  {
    role: ServiceRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
  }
);

const rolePolicyAttachment_ebManagedUpdatesCustomer = new aws.iam.RolePolicyAttachment(
  "role-policy-eb-managed-updates-customer",
  {
    role: ServiceRole.name,
    policyArn: "arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
  }
);

const connectionString = pulumi.interpolate `${elb.dnsName}:8080`

// Create an Elastic Beanstalk environment for the application
const env = new aws.elasticbeanstalk.Environment("my-env", {
    application: app.name,
    version: version,
    solutionStackName: "64bit Amazon Linux 2 v3.5.7 running Docker",
    settings: [
      { namespace: "aws:autoscaling:launchconfiguration", name: "IamInstanceProfile", value: instanceProfile.name },
      { namespace: "aws:autoscaling:launchconfiguration", name: "InstanceType", value: "t2.micro" },
      { namespace: "aws:elasticbeanstalk:environment", name: "ServiceRole", value: ServiceRole.arn },
      { namespace: "aws:elasticbeanstalk:environment", name: "EnvironmentType", value: "LoadBalanced" },
      { namespace: "aws:elasticbeanstalk:healthreporting:system", name: "SystemType", value: "enhanced" },  
      { namespace: "aws:elasticbeanstalk:application:environment", name: `CONNECTION_STRING`, value: connectionString },    
    ],
});

// Create a CloudFront Distribution
const distribution = new aws.cloudfront.Distribution("my-cloudfront-distribution", {
  enabled: true,
  defaultCacheBehavior: {
      targetOriginId: env.id,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD", "OPTIONS"],
      forwardedValues: {
        queryString: false,
        cookies: {
            forward: "none",
        },
    },
  },
  origins: [{
      domainName: env.endpointUrl,
      originId: env.id,
      customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: "http-only",
          originSslProtocols: ["TLSv1", "TLSv1.1", "TLSv1.2"],
      },
  }],
  restrictions: {
    geoRestriction: {
        restrictionType: "whitelist",
        locations: [
            "US",
            "CA",
            "GB",
            "DE",
            "PL",
        ],
    },
},
  viewerCertificate: {
    cloudfrontDefaultCertificate: true,
},
});

// Export the Elastic Beanstalk environment URL and the CloudFront domain name
export const endpointUrl = env.endpointUrl;
export const cloudFrontDomain = distribution.domainName;
