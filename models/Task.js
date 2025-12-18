import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  orgId: { type: Number , required: true },
  userId: { type: Number , required: true },
  type: { type: String, required: true, enum: ['provision_vm', 'terminate_vm', 'reconcile_vm'] },
  payload: { type: Object, required: true },
  status: { type: String, enum: ['queued', 'running', 'failed', 'succeeded'], default: 'queued' },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  lockedBy: { type: String, default: null },
  lockedAt: { type: Date, default: null },
  runAfter: { type: Date, default: Date.now },
  result: { type: Object, default: {} }
}, { timestamps: true });

taskSchema.index({ status: 1, runAfter: 1 });
taskSchema.index({ type: 1, orgId: 1 });

export default mongoose.model('Task', taskSchema);




// tasks — async job queue / orchestrator

// Purpose: run, retry, schedule background operations (provision, reconcile, cleanup). This is the heartbeat of your orchestration and should be durable.