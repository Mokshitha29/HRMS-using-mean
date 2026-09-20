const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms_db';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n======================================================`);
    console.error(`[MongoDB Connection Error]`);
    console.error(`Failed to connect to MongoDB at: ${uri}`);
    console.error(`Details: ${error.message}`);
    console.error(`------------------------------------------------------`);
    console.error(`Troubleshooting Steps:`);
    console.error(`1. Check if the Windows MongoDB Service is running:`);
    console.error(`   Run in PowerShell: Get-Service -Name MongoDB`);
    console.error(`   To start: net start MongoDB`);
    console.error(`2. Or use a free cloud MongoDB Atlas cluster:`);
    console.error(`   Update MONGO_URI in server/.env with your Atlas URI.`);
    console.error(`======================================================\n`);
    process.exit(1);
  }
};

module.exports = connectDB;
