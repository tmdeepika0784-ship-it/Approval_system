require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Holiday = require('../models/Holiday');
const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Holiday.deleteMany();

    console.log('Existing data cleared');

    // Create users for each role
    const users = [
      {
        name: 'Arjun',
        email: 'employee@test.com',
        password: 'password123',
        phone: '+1234567890',
        employeeId: 'EMP-0001',
        role: 'Employee',
        department: 'Operations'
      },
      {
        name: 'Priya',
        email: 'manager@test.com',
        password: 'password123',
        phone: '+1234567891',
        employeeId: 'MGR-0001',
        role: 'Manager',
        department: 'Operations'
      },
      {
        name: 'Ananya',
        email: 'hr@test.com',
        password: 'password123',
        phone: '+1234567892',
        employeeId: 'HR-0001',
        role: 'HR',
        department: 'Human Resources'
      },
      {
        name: 'Karthik',
        email: 'it@test.com',
        password: 'password123',
        phone: '+1234567893',
        employeeId: 'IT-0001',
        role: 'IT & Purchase',
        department: 'Technology'
      },
      {
        name: 'Sneha',
        email: 'finance@test.com',
        password: 'password123',
        phone: '+1234567894',
        employeeId: 'FIN-0001',
        role: 'Finance',
        department: 'Finance'
      },
      {
        name: 'Rahul',
        email: 'accountant@test.com',
        password: 'password123',
        phone: '+1234567895',
        employeeId: 'ACC-0001',
        role: 'Accountant',
        department: 'Finance'
      },
      {
        name: 'Vikram',
        email: 'gm@test.com',
        password: 'password123',
        phone: '+1234567896',
        employeeId: 'GM-0001',
        role: 'General Manager',
        department: 'Management'
      },
      {
        name: 'Aditya',
        email: 'ceo@test.com',
        password: 'password123',
        phone: '+1234567897',
        employeeId: 'CEO-0001',
        role: 'CEO',
        department: 'Executive'
      }
    ];

    // Create users one by one to trigger pre-save hook for password hashing
    for (const userData of users) {
      await User.create(userData);
    }
    console.log('Users created successfully');

    // Create some sample holidays for 2024
    const holidays = [
      {
        date: new Date('2024-01-01'),
        name: "New Year's Day",
        description: 'Public Holiday'
      },
      {
        date: new Date('2024-07-04'),
        name: 'Independence Day',
        description: 'Public Holiday'
      },
      {
        date: new Date('2024-12-25'),
        name: 'Christmas Day',
        description: 'Public Holiday'
      }
    ];

    await Holiday.insertMany(holidays);
    console.log('Holidays created successfully');

    console.log('\n=== Seed Data Summary ===');
    console.log('Users created:');
    users.forEach(user => {
      console.log(`  - ${user.role}: ${user.email} / password123`);
    });

    console.log('\nDatabase seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
