import mongoose from "mongoose";

const providerCredSchema = new mongoose.Schema({
  orgId: { type: Number, required: true, unique: true }, // one primary provider per org (extendable)
  provider: { type: String, enum: ["aws","gcp","azure"], required: true },
  // For AWS cross-account: store RoleArn and optional externalId
  roleArn: { type: String, default: null },
  externalId: { type: String, default: null },
  // For managed accounts (if Axeiro manages keys) store encrypted KMS pointer
  encryptedCredRef: { type: String, default: null }, // pointer to encrypted data in secrets store
  regionDefaults: [String], // allowed regions
  status: { type: String, enum: ["active","pending","failed","revoked"], default: "pending" },
  lastValidatedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

providerCredSchema.index({ orgId: 1, provider: 1 });

export default mongoose.model("ProviderCredential", providerCredSchema);


// provider_credentials — org-level provider connection

// Purpose: store connection info to user’s cloud account (RoleArn, provider type). Keep secrets encrypted & minimal.