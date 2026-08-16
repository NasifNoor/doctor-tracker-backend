import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import mongoose from "mongoose";

export const createDoctor = async (req, res) => {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    if (!name || !specialization || !hospital || !phone || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Name, specialization, hospital, phone, and email are required",
      });
    }

    const existingDoctor = await Doctor.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: "A doctor with this email already exists",
      });
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email: email.toLowerCase().trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor,
    });
  } catch (error) {
    console.error("Create doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      specialization = "",
      from = "",
      to = "",
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    if (specialization.trim()) {
      filter.specialization = new RegExp(specialization.trim(), "i");
    }

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        filter.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
      }

      if (to) {
        filter.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
      }
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Doctor.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    return res.status(200).json({
      success: true,
      doctors,
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
    console.error("Get doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid doctor ID",
    });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, hospital, phone, email } = req.body;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();

      const existingDoctor = await Doctor.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingDoctor) {
        return res.status(409).json({
          success: false,
          message: "A doctor with this email already exists",
        });
      }

      doctor.email = normalizedEmail;
    }

    if (name !== undefined) doctor.name = name;
    if (specialization !== undefined) {
      doctor.specialization = specialization;
    }
    if (hospital !== undefined) doctor.hospital = hospital;
    if (phone !== undefined) doctor.phone = phone;

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid doctor ID or request data",
    });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("Delete doctor error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid doctor ID",
    });
  }
};

export const getDoctorPatients = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id).select(
      "name specialization hospital",
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const patients = await Patient.find({
      doctorId: id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      doctor,
      patients,
    });
  } catch (error) {
    console.error("Get doctor patients error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor patients",
    });
  }
};

//no need
export const addDoctorPatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id).select("_id");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const { name, age, gender, phone, email, condition } = req.body;

    if (!name || age === undefined || !gender || !phone || !condition) {
      return res.status(400).json({
        success: false,
        message: "Name, age, gender, phone, and condition are required",
      });
    }

    const patient = await Patient.create({
      doctorId: id,
      name,
      age,
      gender,
      phone,
      email: email?.toLowerCase().trim(),
      condition,
    });

    return res.status(201).json({
      success: true,
      message: "Patient added to doctor successfully",
      patient,
    });
  } catch (error) {
    console.error("Add doctor patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add patient",
    });
  }
};

export const deleteDoctorPatient = async (req, res) => {
  try {
    const { id, patientId } = req.params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor or patient ID",
      });
    }

    const patient = await Patient.findOneAndDelete({
      _id: patientId,
      doctorId: id,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found for this doctor",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient removed from doctor successfully",
    });
  } catch (error) {
    console.error("Delete doctor patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove patient",
    });
  }
};
