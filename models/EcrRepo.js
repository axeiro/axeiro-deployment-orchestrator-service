import mongoose from "mongoose";

const ecrRepoSchema = new mongoose.Schema({
  orgId: { type: Number, required: true,  },
  repoName: { type: String, required: true,  },
  imageUri: { type: String, required: true },
  tag: { type: String, required: true },
  pushedAt: { type: Date, default: Date.now },
  buildId: { type: mongoose.Types.ObjectId, ref: "Build" },
}, { timestamps: true });

ecrRepoSchema.index({ orgId: 1, repoName: 1, tag: 1 }, { unique: true });

export default mongoose.model("EcrRepo", ecrRepoSchema);



// ecr_repos (or image registry metadata)

// Purpose: track pushed images and tags for deployments.