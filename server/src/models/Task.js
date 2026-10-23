import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 1200, default: "" },
  category: { type: String, trim: true, maxlength: 40, default: "Personal" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  dueDate: { type: String, default: "" },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

taskSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model("Task", taskSchema);
