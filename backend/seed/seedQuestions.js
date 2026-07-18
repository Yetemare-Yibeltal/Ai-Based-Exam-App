const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');
const Admin = require('../models/Admin');
const questions = require('./questions');

dotenv.config({ path: '../.env' });

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const admin = await Admin.findOne({ isSuperAdmin: true });

    if (!admin) {
      console.error('❌ No admin found. Run seedAdmin.js first');
      process.exit(1);
    }

    console.log(`Using admin: ${admin.name} (${admin.email})`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const q of questions) {
      try {
        const existing = await Question.findOne({
          questionText: q.questionText,
          subject: q.subject,
        });

        if (existing) {
          skipped++;
          continue;
        }

        await Question.create({
          ...q,
          createdBy: admin._id,
          createdByModel: 'Admin',
          status: 'approved',
          approvedBy: admin._id,
          approvedAt: new Date(),
          isAIGenerated: false,
        });

        created++;
        process.stdout.write(`\r✅ Created: ${created} | Skipped: ${skipped} | Errors: ${errors}`);
      } catch (err) {
        errors++;
        console.error(`\n❌ Error creating question: ${q.questionText?.slice(0, 50)}...`);
        console.error(`   Error: ${err.message}`);
      }
    }

    console.log('\n\n─────────────────────────────────');
    console.log('SEED QUESTIONS SUMMARY:');
    console.log(`  Total in file:  ${questions.length}`);
    console.log(`  Created:        ${created}`);
    console.log(`  Skipped:        ${skipped}`);
    console.log(`  Errors:         ${errors}`);
    console.log('─────────────────────────────────');

    const subjectCounts = await Question.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log('\nQuestions in database by subject:');
    subjectCounts.forEach((s) => {
      console.log(`  ${s._id.padEnd(12)}: ${s.count} questions`);
    });

    const total = await Question.countDocuments({ status: 'approved' });
    console.log(`\n  TOTAL: ${total} approved questions`);
    console.log('─────────────────────────────────\n');

    mongoose.connection.close();
    console.log('Done!');
  } catch (error) {
    console.error('❌ Seed questions error:', error.message);
    process.exit(1);
  }
};

seedQuestions();