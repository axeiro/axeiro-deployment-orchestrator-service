import mongoose from "mongoose";

const IntegrationSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,          // comes from Auth Service JWT
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["github", "gitlab"],
      required: true,
    },

    accessToken: {
      type: String,
      required: true,
    },

    scopes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/* Enforce one integration per provider per user */
IntegrationSchema.index(
  { userId: 1, provider: 1 },
  { unique: true }
);

export default mongoose.model("Integrations", IntegrationSchema);
