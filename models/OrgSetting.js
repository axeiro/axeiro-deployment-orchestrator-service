import mongoose from "mongoose";

const orgSettingsSchema = new mongoose.Schema({
  orgId: { type: Number, required: true, index: true, unique: true },
  preferredRegion: { type: String, default: "ap-south-1" },
  quotas: {
    vmLimit: { type: Number, default: 3 },
    cpuLimit: { type: Number, default: 4 },
    storageLimitGb: { type: Number, default: 100 }
  },
  allowCreateExternalAdmin: { type: Boolean, default: false },
  billingAccountRef: { type: String, default: null }, // pointer to billing service
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("OrgSetting", orgSettingsSchema);


// org_settings

// Purpose: store org-level preferences & quotas (region, plan limits). This helps enforce ABAC/hybrid model.