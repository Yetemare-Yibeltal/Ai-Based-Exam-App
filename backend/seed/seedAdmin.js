const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("../models/Admin");

dotenv.config({ path: "../.env" });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const existingAdmin = await Admin.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log(`Admin already exists: ${existingAdmin.email}`);
      mongoose.connection.close();
      return;
    }

    const admin = await Admin.create({
      name: process.env.ADMIN_NAME || "HEROY Admin",
      email: process.env.ADMIN_EMAIL || "admin@heroy.com",
      password: process.env.ADMIN_PASSWORD || "Admin@heroy2024",
      role: "admin",
      isSuperAdmin: true,
      isActive: true,
      isEmailVerified: true,
      permissions: {
        manageStudents: true,
        manageTeachers: true,
        manageQuestions: true,
        approveQuestions: true,
        viewAnalytics: true,
        manageSettings: true,
        viewReports: true,
        manageNotifications: true,
        manageAdmins: true,
      },
    });

    console.log("✅ Admin created successfully!");
    console.log(`   Name:  ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}`);
    console.log(`   Super Admin: ${admin.isSuperAdmin}`);

    mongoose.connection.close();
    console.log("Done!");
  } catch (error) {
    console.error("❌ Seed admin error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
