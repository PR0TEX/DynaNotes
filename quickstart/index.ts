import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as synced from "@pulumi/synced-folder";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket", {
    website: {
        indexDocument: "index.html",
    },
});

const folder = new synced.S3BucketFolder("synced-folder", {
    path: "./build",
    bucketName: bucket.bucket,
    acl: aws.s3.PublicReadAcl,

    // Set this property to false to fall back to the cloud-provider CLI.
    managedObjects: false,
});

// Export the name of the bucket
export const bucketName = bucket.id;
export const bucketEndpoint = pulumi.interpolate`http://${bucket.websiteEndpoint}`;