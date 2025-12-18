import mongoose from "mongoose";

const StatusEnum = ["creating","provisioning","pending","running","stopping","stopped","failed","deleted","terminating"];

const vmSchema = new mongoose.Schema({
  orgId: { type: Number, required: true, },      // references organizations.id in auth mysql
  userId: { type: Number, required: true, index: true },     // who created it
  name: { type: String, required: true, index: true },
  description: { type: String, default: "" },

  // provider & identity
  provider: { type: String, enum: ["aws","gcp","azure","digitalocean","managed"], required: true, index: true },
  providerAccountId: { type: String, default: null },        // account id (for cross-account)
  providerRoleArn: { type: String, default: null },         // used for assume-role (do not store secrets)
  region: { type: String, required: true, index: true },

  // cloud instance identifiers
  instanceId: { type: String, default: null,  }, // e.g. i-0abc1234
  instanceType: { type: String, default: "t3.micro" },
  ami: { type: String, default: null },

  // networking
  privateIp: { type: String, default: null },
  publicIp: { type: String, default: null },
  subnetId: { type: String, default: null },
  securityGroups: [String],

  // resource plan & quotas
  cpu: { type: Number, default: 1 },
  ramMb: { type: Number, default: 1024 },
  diskGb: { type: Number, default: 20 },

  // lifecycle
  status: { type: String, enum: StatusEnum, default: "creating", },
  statusHistory: [{
    status: String,
    reason: String,
    at: { type: Date, default: Date.now }
  }],

  // metadata
  tags: { type: Map, of: String },
  labels: { type: Map, of: String },

  // deployment relation
  lastDeploymentId: { type: mongoose.Types.ObjectId, ref: "Deployment", default: null },

  // billing footprint & runtime counters
  launchedAt: { type: Date, default: null, index: true },
  terminatedAt: { type: Date, default: null },

  // soft-delete & audit
  deleted: { type: Boolean, default: false, index: true },
  createdBy: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now,  },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });

// Indexes
vmSchema.index({ orgId: 1, status: 1 });
vmSchema.index({ orgId: 1, createdAt: -1 });
vmSchema.index({ instanceId: 1 }, { unique: false, sparse: true });

export default mongoose.model("VM", vmSchema);



// vms — core VM document

// Purpose: Single source of truth for each VM/provisioned instance. Use this for UI, billing, operators.

// Key queries:

// find vms for user/org → /vm/list

// find vm by instanceId → provider reconciliation

// find vms by status → background reconcile jobs