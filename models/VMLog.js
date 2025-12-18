import mongoose from "mongoose";

const vmLogSchema = new mongoose.Schema({
  orgId: { type: Number, required: true, index: true },
  vmId: { type: mongoose.Types.ObjectId, ref: "VM", required: true, index: true },
  deploymentId: { type: mongoose.Types.ObjectId, ref: "Deployment" },
  level: { type: String, enum: ["debug","info","warn","error"], default: "info", index: true },
  message: { type: String, required: true },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now,  }
});

// TTL: expire logs older than 90 days (adjust to your retention policy)
vmLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.model("VMLog", vmLogSchema);



// vm_logs — streaming logs / events (large volume, TTL)

// Purpose: store logs and events per VM. Use for UI, troubleshooting, and for feeding AI ops later.