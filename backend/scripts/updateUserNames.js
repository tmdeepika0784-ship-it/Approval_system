#!/usr/bin/env node

/**
 * Update Demo User Names Script
 * Updates the existing demo users' names in the MongoDB database
 * 
 * Usage: node scripts/updateUserNames.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

const userUpdates = [
  { email: 'employee@test.com', newName: 'Arjun' },
  { email: 'manager@test.com', newName: 'Priya' },
  { email: 'hr@test.com', newName: 'Ananya' },
  { email: 'it@test.com', newName: 'Karthik' },
  { email: 'finance@test.com', newName: 'Sneha' },
  { email: 'accountant@test.com', newName: 'Rahul' },
  { email: 'gm@test.com', newName: 'Vikram' },
  { email: 'ceo@test.com', newName: 'Aditya' }
];

async function updateUserNames() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB\n');

    console.log('📝 Updating demo user names...\n');

    for (const update of userUpdates) {
      const user = await User.findOne({ email: update.email });
      
      if (user) {
        const oldName = user.name;
        user.name = update.newName;
        await user.save();
        console.log(`✓ Updated ${update.email}: "${oldName}" → "${update.newName}"`);
      } else {
        console.log(`✗ User not found: ${update.email}`);
      }
    }

    console.log('\n✅ All demo user names updated successfully!');
    console.log('\nUpdated users:');
    
    for (const update of userUpdates) {
      const user = await User.findOne({ email: update.email });
      if (user) {
        console.log(`  - ${user.role}: ${user.name} (${user.email})`);
      }
    }

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error updating user names:');
    console.error(error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

updateUserNames();
