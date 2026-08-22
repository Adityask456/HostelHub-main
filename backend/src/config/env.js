import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://adikenchangoudar_db_user:itqNrR44N5c4rocC@aditya.rrbybfy.mongodb.net/hostelhub?retryWrites=true&w=majority",
  JWT_SECRET: process.env.HOSTELHUB_SECRET_JWT || "hostelhub_secret_jwt_key_2026_aditya",
};

