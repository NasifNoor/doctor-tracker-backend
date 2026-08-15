import mongoose from "mongoose";

import { Patient } from "../models/Patient.js";
import { Doctor } from "../models/Doctor.js";

export const createPatient = async (req, res) => {
  try {
    const { doctorId, name, age, gender, phone, email, condition } = req.body;

    if (
      !doctorId ||
      !name ||
      age === undefined ||
      !gender ||
      !phone ||
      !condition
    ) {
      return res.status(400).json({
        success: false,
        message: "Doctor, name, age, gender, phone, and condition are required",
      });
    }

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(doctorId).select("_id");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const patient = await Patient.create({
      doctorId,
      name,
      age,
      gender,
      phone,
      email: email?.toLowerCase().trim(),
      condition,
    });

    return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient,
    });
  } catch (error) {
    console.error("Create patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, condition, doctorId } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};

    if (doctorId) {
      if (!mongoose.isValidObjectId(doctorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID",
        });
      }

      filter.doctorId = doctorId;
    }

    if (condition) {
      filter.condition = condition;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate("doctorId", "name specialization")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Patient.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    return res.status(200).json({
      success: true,
      patients,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Get patients error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(id).populate(
      "doctorId",
      "name specialization hospital",
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, name, age, gender, phone, email, condition } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (doctorId !== undefined) {
      if (!mongoose.isValidObjectId(doctorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID",
        });
      }

      const doctor = await Doctor.findById(doctorId).select("_id");

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      patient.doctorId = doctorId;
    }

    if (name !== undefined) patient.name = name;
    if (age !== undefined) patient.age = age;
    if (gender !== undefined) patient.gender = gender;
    if (phone !== undefined) patient.phone = phone;
    if (condition !== undefined) patient.condition = condition;

    if (email !== undefined) {
      patient.email = email ? email.toLowerCase().trim() : undefined;
    }

    await patient.save();

    const updatedPatient = await Patient.findById(id).populate(
      "doctorId",
      "name specialization hospital",
    );

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Update patient error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid patient data",
    });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Delete patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
