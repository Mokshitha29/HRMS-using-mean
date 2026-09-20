const net = require('net');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function runDiagnostics() {
  console.log('====================================================');
  console.log('       HRMS SYSTEM & MONGODB DIAGNOSTICS            ');
  console.log('====================================================\n');

  // 1. Check Common MongoDB Windows Installation Paths
  console.log('[1/4] Checking standard MongoDB installation directories on Windows...');
  const possiblePaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\5.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\4.4\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\4.2\\bin\\mongod.exe',
    'C:\\MongoDB\\bin\\mongod.exe',
  ];

  let foundBinary = null;
  for (const binPath of possiblePaths) {
    if (fs.existsSync(binPath)) {
      foundBinary = binPath;
      break;
    }
  }

  if (foundBinary) {
    console.log(`  -> MongoDB binary FOUND at: "${foundBinary}"`);
  } else {
    // Check if the base directory exists
    const baseDir = 'C:\\Program Files\\MongoDB';
    if (fs.existsSync(baseDir)) {
      console.log(`  -> Folder "${baseDir}" exists, checking subfolders...`);
      try {
        const sub = fs.readdirSync(baseDir);
        console.log(`  -> Contents: ${sub.join(', ')}`);
      } catch (e) {
        console.log(`  -> Cannot inspect contents: ${e.message}`);
      }
    } else {
      console.log('  -> MongoDB is NOT installed in standard "C:\\Program Files\\MongoDB" path.');
    }
  }

  // 2. Check TCP port 27017
  console.log('\n[2/4] Testing TCP connection to 127.0.0.1:27017 (Port status)...');
  const portListening = await new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(27017, '127.0.0.1');
  });

  if (portListening) {
    console.log('  -> Port 27017 is OPEN and LISTENING! MongoDB service is currently active.');
  } else {
    console.log('  -> Port 27017 is CLOSED / NOT LISTENING.');
  }

  // 3. Test Mongoose Database Connection
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms_db';
  console.log(`\n[3/4] Testing Mongoose connection to: "${mongoUri}"...`);
  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`  -> SUCCESS! Connected to MongoDB host: ${conn.connection.host}, database: ${conn.connection.name}`);
    await mongoose.disconnect();
  } catch (err) {
    console.log(`  -> FAILED to connect: ${err.message}`);
  }

  // 4. Check Port 5000 (Backend Port)
  console.log('\n[4/4] Checking Port 5000 (Express Backend Port)...');
  const port5000InUse = await new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(5000, '127.0.0.1');
  });

  if (port5000InUse) {
    console.log('  -> WARNING: Port 5000 is ALREADY IN USE by another process.');
    console.log('  -> (This caused the EADDRINUSE error when running npm start).');
  } else {
    console.log('  -> Port 5000 is FREE and available for the Express server.');
  }

  console.log('\n====================================================');
  console.log('                 SUMMARY OF ACTIONS                 ');
  console.log('====================================================');

  if (portListening) {
    console.log('MongoDB is running! You can run:');
    console.log('  npm run seed');
    console.log('  npm start');
  } else if (foundBinary) {
    console.log('MongoDB is installed but NOT running.');
    console.log('To start the Windows service, open PowerShell as Admin and run:');
    console.log('  net start MongoDB');
    console.log('Or run the binary directly:');
    console.log(`  & "${foundBinary}" --dbpath "C:\\data\\db"`);
  } else {
    console.log('MongoDB is NOT installed locally on this machine.');
    console.log('Follow the installation instructions provided to install MongoDB Community Server.');
  }
  console.log('====================================================\n');
}

runDiagnostics();
