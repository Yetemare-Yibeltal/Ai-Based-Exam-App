const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const Question = require("../models/Question");
const Score = require("../models/Score");
const Session = require("../models/Session");
const Notification = require("../models/Notification");
const AIGenerationLog = require("../models/AIGenerationLog");
const QuestionApproval = require("../models/QuestionApproval");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB Connected");
};

const clearDB = async () => {
  const hasConfirm = process.argv.includes("--confirm");
  if (!hasConfirm) {
    console.error("❌ Safety check: pass --confirm flag to clear database");
    console.error("   Usage: node seed/clearDB.js --confirm");
    process.exit(1);
  }

  try {
    await connectDB();
    console.log("🗑️  Clearing database...");

    const results = await Promise.all([
      User.deleteMany({}),
      Teacher.deleteMany({}),
      Admin.deleteMany({}),
      Question.deleteMany({}),
      Score.deleteMany({}),
      Session.deleteMany({}),
      Notification.deleteMany({}),
      AIGenerationLog.deleteMany({}),
      QuestionApproval.deleteMany({}),
    ]);

    console.log(`✅ Cleared:
  - Users: ${results[0].deletedCount}
  - Teachers: ${results[1].deletedCount}
  - Admins: ${results[2].deletedCount}
  - Questions: ${results[3].deletedCount}
  - Scores: ${results[4].deletedCount}
  - Sessions: ${results[5].deletedCount}
  - Notifications: ${results[6].deletedCount}
  - AI Logs: ${results[7].deletedCount}
  - Approvals: ${results[8].deletedCount}`);

    console.log("\n🎉 Database cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing database:", error.message);
    process.exit(1);
  }
};

clearDB();
