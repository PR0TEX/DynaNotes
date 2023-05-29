import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config("gcp");
const projectId = config.get("project") || "";
const location = config.get("region") || "europe-central2";

// Docker image from Google Artifact Registry
const backendImageName = "europe-central2-docker.pkg.dev/dynanotes-v-1/dynarepo/backend:latest";
const mongoImageName = "europe-central2-docker.pkg.dev/dynanotes-v-1/dynarepo/mongo:latest"

// Create the Google Cloud Run service
const cloudRunService = new gcp.cloudrun.Service("backend-cloudrun", {
    location: "europe-central2",
    metadata: {
        namespace: projectId,
    },
    template: {
        spec: {
            containers: [
                {
                    image: backendImageName,
                },
            ],
        },
    },
});

// Create a Cloud Run service with MongoDB
const mongoCloudRun = new gcp.cloudrun.Service("mongo-cloud-run", {
  location: location,
  template: {
      spec: {
          containers: [
              {
                  image: mongoImageName,
              },
          ],
      },
  },
  traffics: [
      {
          latestRevision: true,
          percent: 100,
      },
  ],
});

// Set the IAM policy to give invokers access
const mongoCloudRunPolicy = new gcp.cloudrun.IamMember("mongo-cloud-run-policy", {
  location: mongoCloudRun.location,
  service: mongoCloudRun.name,
  role: "roles/run.invoker",
  member: "allUsers",
});

// Enable App Engine and Cloud Build APIs
const appengineApi = new gcp.projects.Service("appengine-api", {
    service: "appengine.googleapis.com",
    project: projectId,
  });

const cloudbuildApi = new gcp.projects.Service("cloudbuild-api", {
  service: "cloudbuild.googleapis.com",
  project: projectId,
});

// Deploy theSPA application to Google Cloud App Engine using a custom runtime.
const appEngineApplication = new gcp.appengine.Application("dynanotes-engine", {
    project: projectId,
    locationId: location,
}, { dependsOn: [appengineApi, cloudbuildApi] });

const appEngineVersion = new gcp.appengine.FlexibleAppVersion("app-engine-version", {
    versionId: "v3",
    project: projectId,
    service: "default",
    runtime: "nodejs",
    // entrypoint: { shell: "node src/App.tsx" },
    deployment: {
        container: {
            image: `europe-central2-docker.pkg.dev/dynanotes-v-1/dynarepo/frontend:latest`,
        },
    },
    livenessCheck: {
        path: "/",
    },
    readinessCheck: {
        path: "/",
        appStartTimeout: "300s",
    },
    automaticScaling: {
        coolDownPeriod: "120s",
        cpuUtilization: {
            targetUtilization: 0.5,
        },
        minTotalInstances: 1,
        maxTotalInstances: 8
    },
});

// Export the deployed Cloud Run service URL
export const serviceUrl = cloudRunService.statuses[0].url;

// Expose the MongoDB service URL
export const mongoServiceUrl = mongoCloudRun.statuses[0].url;
