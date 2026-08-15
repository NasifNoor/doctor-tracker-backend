import { Schema, model } from "mongoose";

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    hospital: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

doctorSchema.index({ name: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ createdAt: -1 });

export const Doctor = model("Doctor", doctorSchema);
