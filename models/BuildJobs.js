import mongoose from "mongoose";

const buildJobSchema = new mongoose.Schema(
  {
    deploymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deployments",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "RUNNING", "SUCCESS", "FAILED"],
      default: "PENDING",
      index: true,
    },

    spec:Object , 

    image: {
      type: String,
    },

    attempt: { type: Number, default: 1 },

    logs: {
      type: String, // optional: short error / build summary
    },

    error: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("BuildJobs", buildJobSchema);
