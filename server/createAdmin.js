
require("dotenv").config();
const mongoose = require('mongoose');
const User = require('./models/userModel');

const MONGO_URI = process.env.MONGODB_URI 

async function createAdmin() {
  await mongoose.connect(MONGO_URI, {
    dbName: "parapharm_ecommerce"
  });
  console.log(" Using DB:", mongoose.connection.name);

  const email = "MMM@admin.com";

  // Check all users in the database
  const allUsers = await User.find({});
  console.log("Current users in database:", allUsers.map(u => ({
    email: u.email,
    isAdmin: u.isAdmin,
    provider: u.provider
  })));

  const existing = await User.findOne({ email });
  console.log("Existing user check:", existing ? {
    id: existing._id,
    email: existing.email,
    isAdmin: existing.isAdmin,
    provider: existing.provider
  } : "no existing user");

  if (existing) {
    // Delete existing admin to recreate it
    await User.deleteOne({ email });
    console.log("Deleted existing admin account.");
  }

  // Create admin user - let the model handle password hashing
  const adminUser = await User.create({
    firstName: "MMM",
    lastName: "Admin",
    email,
    password: "MMMadmin", // Model will hash this automatically
    phoneNumber: "+21600000000",
    role: "admin",
    isAdmin: true,
    provider: "local"
  });

  console.log("Created admin user:", {
    id: adminUser._id,
    email: adminUser.email,
    isAdmin: adminUser.isAdmin,
    provider: adminUser.provider,
    hasPassword: !!adminUser.password
  });
  
  // Verify the user was created
  const verifyUser = await User.findOne({ email });
  console.log("Verification - Found user:", verifyUser ? {
    id: verifyUser._id,
    email: verifyUser.email,
    isAdmin: verifyUser.isAdmin,
    provider: verifyUser.provider,
    hasPassword: !!verifyUser.password
  } : "no user found");

  // Test password matching
  const passwordTest = await verifyUser.matchPassword("MMMadmin");
  console.log("Password verification test:", passwordTest ? "SUCCESS" : "FAILED");

  console.log(" Admin created with email: MMM@admin.com and password: MMMadmin");
  process.exit();
}

createAdmin().catch((err) => {
  console.error("Error creating admin:", err);
  process.exit(1);
});
