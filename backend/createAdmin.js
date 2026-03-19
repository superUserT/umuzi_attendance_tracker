require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.');
  process.exit(1);
}

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB Connected');

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('Admin user with this email already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      name: 'Admin',
      surname: 'User'
    });

    await newAdmin.save();
    console.log('Admin user created successfully.');

  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

createAdmin();
