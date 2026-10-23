
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // Required for password-based accounts,
    // but not for Google-only accounts.
    passwordHash: {
      type: String,
      select: false
    },

    // Google's unique identifier for this account.
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
