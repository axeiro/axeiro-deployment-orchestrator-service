import mongoose from "mongoose";

const domainMappingSchema = new mongoose.Schema({
  orgId: { type: Number, required: true, index: true },
  vmId: { type: mongoose.Types.ObjectId, ref: "VM" },
  subdomain: { type: String, required: true,  }, // e.g., demo.axeiro.app
  target: { type: String, required: true }, // ALB DNS or public IP
  validatedAt: { type: Date, default: null },
  ssl: { type: String, enum: ["acm","external","none"], default: "acm" },
  createdAt: { type: Date, default: Date.now }
});
domainMappingSchema.index({ subdomain: 1 }, { unique: true });

export default mongoose.model("DomainMapping", domainMappingSchema);



// domain_mappings

// Purpose: map subdomain → target (ALB DNS or IP). Used for automated DNS & certificate coupling.