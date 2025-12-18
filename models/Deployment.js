import mongoose from "mongoose";

const DeploymentSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "QUEUED",
        "BUILDING_IMAGE",
        "PUSHING_IMAGE",
        "DEPLOYING",
        "RUNNING",
        "FAILED",
      ],
      default: "DRAFT",
      index: true,
    },

    config: {
      appType: { type: String, required: true },
      source: {
        provider: { type: String, enum: ["github", "gitlab"], required: true },
        repo: { type: String, required: true },
        branch: { type: String, default: "main" },
      },
      runtime: { type: String, required: true },
      computeSize: { type: String, required: true },
      spendCap: { type: Number, required: true },
      startCommand: { type: String, required: true },
    },

    logs: {
      type: [String],
      default: [],
    },

    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Deployments", DeploymentSchema);

// const deploymentSpec = {
//   image: null,
//   repo: payload.source.repo,
//   branch: payload.source.branch,
//   runtime: payload.runtime,
//   startCommand: payload.startCommand,
//   cpu: payload.computeSize === "small" ? 256 : 512,
//   memory: payload.computeSize === "small" ? 512 : 1024,
//   env: {
//     NODE_ENV: "production",
//     PORT: 3000,
//   },
// };
