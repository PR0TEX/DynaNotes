
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
});

const myDocDBInstance = new aws.docdb.ClusterInstance("myDocDBInstance", {
    clusterIdentifier: documentDbCluster.id,
    instanceClass: "db.t3.medium",
  });

// Get the endpoint of the DocumentDB cluster as an Output
const clusterEndpoint = pulumi.interpolate `${documentDbCluster.endpoint}`.apply((input) => Buffer.from(input).toString());

const taskDefinition = new aws.ecs.TaskDefinition("myTask", {
    family: "my-task",
    cpu: "256",
    memory: "512",
    taskRoleArn: taskExecutionRole.arn,
    executionRoleArn: taskExecutionRole.arn,
    requiresCompatibilities: ["EC2"],
    networkMode: "host",
    containerDefinitions: JSON.stringify([
        {
          name: "backend",
          image: "ghcr.io/pr0tex/backend:latest",
          // image: "nginx:latest",   
          essential: true,      
          portMappings: [{
            containerPort: 8080,
            hostPort: 8080,
            protocol: "tcp"
          }],
          environment: [
            {name: "SPRING_DATA_MONGODB_HOST", value: clusterEndpoint},
            {name: "SPRING_DATA_MONGODB_PORT", value: "27017"},
            {name: "SPRING_DATA_MONGODB_USERNAME", value: mongoUsername},
            {name: "SPRING_DATA_MONGODB_PASSWORD", value: mongoPassword}        
          ]
        },
    ]),
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