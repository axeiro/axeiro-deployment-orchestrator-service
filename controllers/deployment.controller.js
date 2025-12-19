//  root/controllers/deployment.controller.js
import axios from "axios";
import {BuildJobs, Deployments, Integrations} from '../models/index.js'
import { asyncHandler } from "../utils/asyncHandler.js";
import validateDeploymentPayload from "../utils/validatePayload.js";
import os from 'os'
import { exec } from "child_process";
import { promisify } from "util";
import fs from 'fs'
import path from 'path';   
const execAsync = promisify(exec);
// services/githubIntegration.service.js

export const getGithubTokenForUser = async (userId) => {
  if (!userId) {
    throw new Error("userId is required");
  }

  const integration = await Integrations.findOne({
    userId,
    provider: "github",
  }).lean();

  if (!integration) {
    return null; // user has NOT connected GitHub
  }

  return integration.accessToken;
};

const detectNodeRuntime = ({ pkg, files }) => {
  // 1. Explicit engines field
  if (pkg?.engines?.node) {
    if (pkg?.engines?.node.includes("22")) return "nodejs22";
    if (pkg?.engines?.node.includes("20")) return "nodejs20";
    if (pkg?.engines?.node.includes("18")) return "nodejs18";
  }

  // 2. .nvmrc file
  if (files?.nvmrc) {
    if (files?.nvmrc?.startsWith("22")) return "nodejs22";
    if (files?.nvmrc?.startsWith("20")) return "nodejs20";
    if (files?.nvmrc?.startsWith("18")) return "nodejs18";
  }

  // 3. Default
  return "nodejs18";
};

const detectProjectType = (pkg) => {
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  if (deps.next) return "nextjs";
  if (deps.react && deps.vite) return "react-vite";
  if (deps['@nestjs/core']) return "nestjs";
  if (deps.express) return "express";
  if (pkg.type === "module") return "node-esm";

  return "node";
};

const detectStartCommand = (pkg, type) => {
  if (pkg.scripts?.start) return "npm run start";

  switch (type) {
    case "nextjs":
      return "npm run build && npm run start";

    case "react-vite":
      return "npm run build && npm run preview";

    case "nestjs":
      return "npm run start:prod";

    case "express":
      return `node ${pkg.main || "index.js"}`;

    default:
      return `node ${pkg.main || "index.js"}`;
  }
};

/* -------------------------------------------------
   Helper: get GitHub token for user
-------------------------------------------------- */
export const saveIntegration = async (req, res) => {
  const { userId, accessToken, scopes } = req.body;

  if (!userId || !accessToken) {
    return res.status(400).json({ message: "InvalidsaveNewDeployment" });
  }

  await Integrations.updateOne(
    { userId, provider: "github" },
    {
      $set: {
        accessToken,
        scopes,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  res.status(204).end();
};

/* -------------------------------------------------
   GET /integrations/github/repos
-------------------------------------------------- */
export const getGithubRepos = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = await getGithubTokenForUser(userId);

  if (!token) {
    return res.status(400).json({ message: "GitHub not connected" });
  }

  const response = await axios.get(
    "https://api.github.com/user/repos?per_page=100",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  // Return minimal data only
  const repos = response.data.map((repo) => ({
    id: repo.id,
    full_name: repo.full_name,
    default_branch: repo.default_branch,
    private: repo.private,
  }));

  res.json(repos);
});

/* -------------------------------------------------
   GET /integrations/github/repos/:repo/package-json
-------------------------------------------------- */
export const getRepoPackageJson = async (req, res) => {
  const { username, repo } = req.params;
  const userId = req.user.id;

  const token = await getGithubTokenForUser(userId);

  if (!token) {
    return res.status(401).json({ message: "GitHub not connected" });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${username}/${repo}/contents/package.json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    /* ---------- Decode package.json ---------- */
    const decoded = Buffer.from(
      response.data.content,
      "base64"
    ).toString("utf-8");

   const pkg = JSON.parse(decoded);

const runtime = detectNodeRuntime(pkg);
const projectType = detectProjectType(pkg);
const startCommand = detectStartCommand(pkg, projectType);

return res.json({
  runtime,
  startCommand,
  projectType,
  confidence: pkg.scripts?.start ? "high" : "medium",
});


  } catch (error) {
    if (error.response?.status === 404) {
      return res.json({
        runtime: "unknown",
        startCommand: "",
      });
    }

    console.error(error);
    return res.status(500).json({ message: "Failed to read package.json" });
  }
};

export const deploy = asyncHandler(async (req, res) => {
  console.log("Deploy endpoint hit");

  const errors = validateDeploymentPayload(req.body);
  if (errors.length) {
    return res.status(400).json({
      message: "Invalid deployment config",
      errors,
    });
  }

  const newDeployment = await Deployments.create({
    userId: req?.user?.id,
    status: "QUEUED",
    config: {
      appType: req.body.appType,
      source: {
        provider: req.body?.source?.provider,
        repo: req.body?.source?.repo,
        branch: req.body?.source?.branch,
      },
      runtime: req.body?.runtime,
      computeSize: req.body?.computeSize,
      spendCap: req.body?.spendCap,
      startCommand: req.body?.startCommand,
    },
  });

  // ✅ access values from config
  const deploymentSpec = {
  image: null,
  repo: newDeployment.config.source.repo,
  branch: newDeployment.config.source.branch,
  runtime: newDeployment.config.runtime,
  startCommand: newDeployment.config.startCommand,
  cpu: newDeployment.config.computeSize === "small" ? 256 : 512,
  memory: newDeployment.config.computeSize === "small" ? 512 : 1024,
  env: {
    NODE_ENV: "production",
    PORT: 5000,
  },
};

const buildJob = await BuildJobs.create({
  deploymentId: newDeployment._id,
  status: "PENDING",
  spec: deploymentSpec,
});


  workerLoop()

  return res.status(200).json({
    message: "deployment queued",
    deploymentId: newDeployment._id,
  });
});





const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function workerLoop() {
  while (true) {
    const job = await BuildJobs.findOneAndUpdate(
      { status: "PENDING" },
      { status: "RUNNING", startedAt: new Date() },
      { new: true }
    );

    if (!job) {
      await sleep(3000);
      continue;
    }

    try {
      await runBuild(job);   // clone → build → push (later)

      await Deployments.updateOne(
  { _id: job.deploymentId },
  { status: "BUILDING_IMAGE" }
);

      job.status = "SUCCESS";
      job.finishedAt = new Date();
      await job.save();

      await Deployments.updateOne(
        { _id: job.deploymentId },
        { status: "DEPLOYING" }
      );

    } catch (err) {
      job.status = "FAILED";
      job.error = err.message;
      await job.save();

      await Deployments.updateOne(
        { _id: job.deploymentId },
        { status: "FAILED", error: err.message }
      );
    }
  }
}




async function runBuild(job) {
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
