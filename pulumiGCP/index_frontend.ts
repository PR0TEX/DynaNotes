import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";
import * as fs from "fs";

const config = new pulumi.Config("gcp");
const project = config.get("project") || "";
const gcpJsonKey = fs.readFileSync("dynanotes-v-1-e66d611a23d0.json").toString();
const location = gcp.config.region || "europe-central2";
const sourceImage = "ghcr.io/pr0tex/frontend:latest";
const destinationImage = `gcr.io/${project}/frontend:latest`;

const myaccount = new gcp.serviceaccount.Account("myaccount", {
    accountId: "myaccount",
    displayName: "My Service Account",
});

// Configure auth for Docker and GCR
const gcpKey = new gcp.serviceaccount.Key("gcp-key", {
    serviceAccountId: myaccount.name,
    publicKeyType: "TYPE_X509_PEM_FILE",
  });

// const gcrCred = pulumi.all([gcpKey.privateKey]).apply(([key]) => {
//     const keyObject = JSON.parse(key);
//   return JSON.stringify({
//         type: "service_account",
//         project_id: project,
//         private_key_id: JSON.parse(key).private_key_id,
//         private_key: key,
//         client_email: JSON.parse(key).client_email,
//         client_id: JSON.parse(key).client_id,
//         auth_uri: "https://accounts.google.com/o/oauth2/auth",
//         token_uri: "https://oauth2.googleapis.com/token",
//         auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
//         client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${gcp.config.project}%40appspot.gserviceaccount.com`,
//       });
// });

// Enable App Engine and Cloud Build APIs
const appengineApi = new gcp.projects.Service("appengine-api", {
    service: "appengine.googleapis.com",
    project: project,
  });

const cloudbuildApi = new gcp.projects.Service("cloudbuild-api", {
  service: "cloudbuild.googleapis.com",
  project: project,
});

// Deploy theSPA application to Google Cloud App Engine using a custom runtime.
const appEngineApplication = new gcp.appengine.Application("dynanotes-engine", {
    project: project,
    locationId: location,
}, { dependsOn: [appengineApi, cloudbuildApi] });
// const appEngineApplication = new gcp.appengine.Application("app-engine", {
//     project: project,
//     locationId: "europe-central2",
// });

const appEngineVersion = new gcp.appengine.FlexibleAppVersion("app-engine-version", {
    versionId: "v3",
    project: project,
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

// Export the service URL
// export const serviceUrl = pulumi.interpolate`https://${appEngineApplication.defaultHostname}`;
export const serviceUrl = pulumi.interpolate`https://dynanotes-dot-${project}.uc.r.appspot.com`;


