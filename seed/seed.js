import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { User } from "../src/models/User.js";
import { Doctor } from "../src/models/Doctor.js";
import { Patient } from "../src/models/Patient.js";

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected");

    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});

    console.log("Existing data cleared");

    const adminPassword = await bcrypt.hash("Admin@12345", 12);

    await User.create([
      {
        email: "admin@doctortracker.com",
        passwordHash: adminPassword,
        role: "admin",
      },
    ]);

    console.log("Users created");

    const doctors = await Doctor.create([
      {
        name: "Dr. Sarah Ahmed",
        specialization: "Cardiology",
        hospital: "City General Hospital",
        phone: "+8801712345678",
        email: "sarah.ahmed@doctortracker.com",
      },
      {
        name: "Dr. Rahim Khan",
        specialization: "Neurology",
        hospital: "Central Medical Center",
        phone: "+8801812345678",
        email: "rahim.khan@doctortracker.com",
      },
      {
        name: "Dr. Nadia Islam",
        specialization: "Dermatology",
        hospital: "United Hospital",
        phone: "+8801912345678",
        email: "nadia.islam@doctortracker.com",
      },
    ]);

    console.log("Doctors created");

    await Patient.create([
      {
        doctorId: doctors[0]._id,
        name: "Arif Hossain",
        age: 45,
        gender: "male",
        phone: "+8801612345678",
        email: "arif@example.com",
        condition: "Hypertension",
      },
      {
        doctorId: doctors[0]._id,
        name: "Nusrat Jahan",
        age: 38,
        gender: "female",
        phone: "+8801712345679",
        email: "nusrat@example.com",
        condition: "Arrhythmia",
      },
      {
        doctorId: doctors[1]._id,
        name: "Tanvir Ahmed",
        age: 52,
        gender: "male",
        phone: "+8801812345679",
        email: "tanvir@example.com",
        condition: "Migraine",
      },
      {
        doctorId: doctors[1]._id,
        name: "Sadia Rahman",
        age: 29,
        gender: "female",
        phone: "+8801912345679",
        email: "sadia@example.com",
        condition: "Epilepsy",
      },
      {
        doctorId: doctors[2]._id,
        name: "Mahmud Hasan",
        age: 34,
        gender: "male",
        phone: "+8801612345679",
        email: "mahmud@example.com",
        condition: "Eczema",
      },
    ]);

    console.log("Patients created");
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
