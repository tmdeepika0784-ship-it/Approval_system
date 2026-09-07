#!/usr/bin/env node

/**
 * Database Reset Script
 * Removes all requests and related data while preserving users and authentication
 * 
 * Usage: node scripts/resetDatabase.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Request = require('../src/models/Request');
const Query = require('../src/models/Query');
const User = require('../src/models/User');

async function resetDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');

    // Get counts before deletion
    console.log('\n📊 Current Database State:');
    const userCount = await User.countDocuments();
    const requestCount = await Request.countDocuments();
    const queryCount = await Query.countDocuments();

    console.log(`  - Users: ${userCount}`);
    console.log(`  - Requests: ${requestCount}`);
    console.log(`  - Queries: ${queryCount}`);

    if (requestCount === 0 && queryCount === 0) {
      console.log('\n✓ Database is already clean. No requests or queries to delete.');
      await mongoose.connection.close();
      return;
    }

    // Confirm action
    console.log('\n⚠️  This will DELETE:');
    console.log(`  - All ${requestCount} requests`);
    console.log(`  - All ${queryCount} queries`);
    console.log('\n✓ Will PRESERVE:');
    console.log(`  - All ${userCount} users`);
    console.log('  - User profiles');
    console.log('  - Authentication data');
    console.log('  - Holidays');

    // Start deletion
    console.log('\n🗑️  Deleting request-related data...');

    // Delete all queries (related to requests)
    if (queryCount > 0) {
      await Query.deleteMany({});
      console.log(`  ✓ Deleted ${queryCount} queries`);
    }

    // Delete all requests (including embedded workflow, escalation history, documents, etc.)
    if (requestCount > 0) {
      await Request.deleteMany({});
      console.log(`  ✓ Deleted ${requestCount} requests`);
    }

    // Verify deletion
    console.log('\n📊 Database After Reset:');
    const newUserCount = await User.countDocuments();
    const newRequestCount = await Request.countDocuments();
    const newQueryCount = await Query.countDocuments();

    console.log(`  - Users: ${newUserCount}`);
    console.log(`  - Requests: ${newRequestCount}`);
    console.log(`  - Queries: ${newQueryCount}`);

    console.log('\n✅ Database reset complete!');
    console.log('   System is ready for fresh testing.\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during database reset:');
    console.error(error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
