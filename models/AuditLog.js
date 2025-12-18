import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  orgId: { type: Number,  },
  userId: { type: Number },
  actor: { type: String }, // "user:123" or "system:reconciler"
  action: { type: String, required: true }, // e.g. "vm.create", "vm.delete", "role.change"
  targetType: { type: String }, // "VM","Deployment","Domain"
  targetId: { type: String }, // external id
  details: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now,  }
});

auditSchema.index({ orgId: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditSchema);


// audit_logs

// Purpose: immutable trail for critical actions (security & compliance). Write-once.