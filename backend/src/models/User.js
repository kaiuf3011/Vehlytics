import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager", "viewer"], default: "viewer" },
  name: { type: String, default: "Fleet Operator" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
