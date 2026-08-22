import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { ENV } from "./src/config/env.js";
import { User } from "./src/models/User.js";
import { MessMenu } from "./src/models/MessMenu.js";

async function setupDatabase() {
  try {
    console.log("Connecting to MongoDB:", ENV.MONGODB_URI);
    await mongoose.connect(ENV.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    const hash = await bcrypt.hash("123456", 10);

    // 1. Create or update Warden
    await User.findOneAndUpdate(
      { email: "warden@hostel.com" },
      {
        name: "Warden Admin",
        email: "warden@hostel.com",
        password: hash,
        role: "WARDEN",
      },
      { upsert: true, new: true }
    );
    console.log("✅ Warden account ready: warden@hostel.com / 123456 (Role: WARDEN)");

    // 2. Create or update Admin
    await User.findOneAndUpdate(
      { email: "admin@hostel.com" },
      {
        name: "Hostel Administrator",
        email: "admin@hostel.com",
        password: hash,
        role: "ADMIN",
      },
      { upsert: true, new: true }
    );
    console.log("✅ Admin account ready: admin@hostel.com / 123456 (Role: ADMIN)");

    // 3. Create or update sample Student
    await User.findOneAndUpdate(
      { email: "student@hostel.com" },
      {
        name: "John Student",
        email: "student@hostel.com",
        password: hash,
        role: "STUDENT",
        roomNumber: "101",
      },
      { upsert: true, new: true }
    );
    console.log("✅ Student account ready: student@hostel.com / 123456 (Role: STUDENT, Room: 101)");

    // 4. Seed default Mess Menu if empty
    const menuCount = await MessMenu.countDocuments();
    if (menuCount === 0) {
      const defaultMenus = [
        { day: "Monday", breakfast: "Poha, Boiled Eggs, Tea", lunch: "Dal Makhani, Rice, Roti, Salad", dinner: "Paneer Butter Masala, Roti, Rice, Gulab Jamun" },
        { day: "Tuesday", breakfast: "Aloo Paratha, Curd, Coffee", lunch: "Rajma, Jeera Rice, Chapati, Raita", dinner: "Mix Veg, Dal Tadka, Roti, Kheer" },
        { day: "Wednesday", breakfast: "Idli, Sambar, Coconut Chutney", lunch: "Chole, Bhature, Pulao, Salad", dinner: "Chicken Curry / Paneer, Rice, Roti" },
        { day: "Thursday", breakfast: "Upma, Boiled Eggs, Tea", lunch: "Kadhi Pakoda, Steam Rice, Roti", dinner: "Egg Curry / Dum Aloo, Rice, Roti, Ice Cream" },
        { day: "Friday", breakfast: "Puri Bhaji, Banana, Milk", lunch: "Veg Biryani, Mirchi Ka Salan, Raita", dinner: "Dal Fry, Bhindi Masala, Phulka, Halwa" },
        { day: "Saturday", breakfast: "Masala Dosa, Sambar, Chutney", lunch: "Kashmiri Pulao, Dum Aloo, Chapati", dinner: "Matar Paneer, Dal Tadka, Jeera Rice, Roti" },
        { day: "Sunday", breakfast: "Bread Butter, Omelette / Veg Cutlet", lunch: "Special Thali, Paneer / Chicken, Sweet", dinner: "Fried Rice, Manchurian, Soup" },
      ];
      await MessMenu.insertMany(defaultMenus);
      console.log("✅ Default weekly mess menu seeded");
    }

    console.log("\n🎉 Database setup completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Setup Error:", err.message);
    process.exit(1);
  }
}

setupDatabase();
