import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

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
