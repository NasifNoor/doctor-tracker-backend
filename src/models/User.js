import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "doctor"],
      required: true,
      default: "doctor",
    },
  },
  {
    timestamps: true,
  },
);

export const User = model("User", userSchema);
