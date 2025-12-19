//  root/worker/taskProcessor.js
import {Deployments} from '../models/index.js'
import os from 'os'
import { exec } from "child_process";
import { promisify } from "util";
import fs from 'fs'
import path from 'path';   
const execAsync = promisify(exec);

export async function runBuild(job) {
  const deployment = await Deployments.findById(job.deploymentId);
  if (!deployment) throw new Error("Deployment not found");

  const { repo, branch } = deployment.config.source;
  const { runtime, startCommand } = deployment.config;

  const buildDir = path.join(
  os.tmpdir(),
  `axeiro-build-${job._id}`
);

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

  await exec(`git clone --branch ${branch} https://github.com/${repo}.git ${buildDir}`);

  const dockerfilePath = path.join(buildDir, "Dockerfile");

  if (!fs.existsSync(dockerfilePath)) {
    await generateDockerfile({
      runtime,
      startCommand,
      output: dockerfilePath,
    });
  }

  const imageTag = `axeiro/${deployment._id}:latest`;

  await exec(`
    /kaniko/executor \
      --context ${buildDir} \
      --dockerfile ${dockerfilePath} \
      --destination ${imageTag}
  `);

  job.image = imageTag;
  job.spec.image = imageTag;
  job.markModified("spec");
  job.save()

//   job.spec = {
//   ...job.spec,
//   image: imageTag,
// };
}

function generateDockerfile({ runtime, startCommand, output }) {
  if (!runtime.startsWith("nodejs")) {
    throw new Error(`Unsupported runtime: ${runtime}`);
  }

  const dockerfile = `
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "${startCommand}"]
`;

  fs.writeFileSync(output, dockerfile.trim());
}