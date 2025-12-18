import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  orgId: { type: Number, required: true,  },
  vmId: { type: mongoose.Types.ObjectId, ref: "VM" },
  metricDateHour: { type: Date, required: true,  }, // hour bucket
  cpuSeconds: { type: Number, default: 0 },
  networkBytes: { type: Number, default: 0 },
  storageGbHours: { type: Number, default: 0 },
  costEstimateCents: { type: Number, default: 0 } // optional
});

usageSchema.index({ orgId: 1, metricDateHour: 1 });

export default mongoose.model("UsageMetric", usageSchema);


// usage_metrics — aggregated for billing/quota enforcement

// Purpose: store hourly/day aggregates for CPU hours, public IP hours, storage used.