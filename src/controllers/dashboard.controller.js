import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [totalDoctors, totalPatients, patientsPerDoctor, patientsByDate] =
      await Promise.all([
        Doctor.countDocuments(),

        Patient.countDocuments(),

        Patient.aggregate([
          {
            $group: {
              _id: "$doctorId",
              patientCount: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "doctors",
              localField: "_id",
              foreignField: "_id",
              as: "doctor",
            },
          },
          {
            $unwind: "$doctor",
          },
          {
            $project: {
              _id: 0,
              doctorId: "$doctor._id",
              doctorName: "$doctor.name",
              specialization: "$doctor.specialization",
              patientCount: 1,
            },
          },
          {
            $sort: {
              patientCount: -1,
            },
          },
        ]),

        Patient.aggregate([
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]),
      ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalDoctors,
        totalPatients,
        patientsPerDoctor,
        patientsByDate,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
