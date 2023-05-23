import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Fetch the default VPC information from your AWS account:
// const vpc = new awsx.ec2.DefaultVpc("default-vpc");

// // Create IAM role and instance profile for the EC2 instance
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
  availabilityZones: ["us-east-1a"],
  maxSize: 1,
  minSize: 1,
  desiredCapacity: 1,
  protectFromScaleIn: true,
  launchTemplate: {
    id: foobar.id,
    version: "$Latest"
  },
  // vpcZoneIdentifiers: vpc.publicSubnetIds,
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

const taskDefinition = new aws.ecs.TaskDefinition("myTask", {
    family: "my-task",
    // cpu: "256",
    // memory: "512",
    taskRoleArn: taskExecutionRole.arn,
    executionRoleArn: taskExecutionRole.arn,
    // requiresCompatibilities: ["EC2"],
    // networkMode: "awsvpc",
    containerDefinitions: JSON.stringify([
        {
          name: "backend",
          // image: "ghcr.io/pr0tex/backend:latest",
          image: "nginx:latest",
          memory: 256,
          cpu: 128,      
          essential: true,      
          portMappings: [{
            containerPort: 80,
            hostPort: 80,
            protocol: "tcp"
          }],
        },
    ]),
});

const ecsService = new aws.ecs.Service("myService", {
    name: "my-service",
    cluster: ecsCluster.id,
    taskDefinition: taskDefinition.arn,
    desiredCount: 1,
    launchType: "EC2",
});

export const clusterName = ecsCluster.id;
export const serviceName = ecsService.id;