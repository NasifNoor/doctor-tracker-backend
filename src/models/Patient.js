import { Schema, model } from "mongoose";

const patientSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    condition: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ condition: 1 });
patientSchema.index({ createdAt: -1 });

export const Patient = model("Patient", patientSchema);
