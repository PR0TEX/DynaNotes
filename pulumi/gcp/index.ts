import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();

const app = new gcp.appengine.Application("my-app", {
  locationId: config.get("locationId") || "us-central",
});

const appVersion = new gcp.appengine.StandardAppVersion("my-app-version", {
  service: app.name,
  runtime: "nodejs14",
  entrypoint: "build/server.js",
  deployment: {
    zip: {
      sourceUrl: pulumi.interpolate`https://storage.googleapis.com/${bucket.name}/${bucketObject.name}`,
    },
  },
});
