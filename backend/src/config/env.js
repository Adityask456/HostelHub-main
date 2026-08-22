import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hostelhub",
  JWT_SECRET: process.env.HOSTELHUB_SECRET_JWT || "hostelhub_secret_jwt_key_2026",
};

