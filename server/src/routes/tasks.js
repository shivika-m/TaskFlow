import { Router } from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import requireAuth from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const allowed = new Set(["title", "description", "category", "priority", "dueDate", "completed"]);
function clean(body) {
  const out = {};
  for (const key of allowed) if (body[key] !== undefined) out[key] = body[key];
  if (out.title !== undefined) out.title = String(out.title).trim();
  if (out.description !== undefined) out.description = String(out.description).trim();
  if (out.category !== undefined) out.category = String(out.category).trim() || "Personal";
  if (out.dueDate !== undefined) out.dueDate = String(out.dueDate);
  if (out.priority !== undefined && !["Low", "Medium", "High"].includes(out.priority)) throw new Error("Priority must be Low, Medium, or High.");
  if (out.title !== undefined && (!out.title || out.title.length > 180)) throw new Error("Task title is required and must be under 180 characters.");
  return out;
}

router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ completed: 1, createdAt: -1 }).lean();
    res.json({ tasks });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!data.title) return res.status(400).json({ message: "A task title is required." });
    const task = await Task.create({ ...data, user: req.userId });
    res.status(201).json({ task });
  } catch (error) { next(error); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const data = clean(req.body);
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, { $set: data },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ task });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task ID." });
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted." });
  } catch (error) { next(error); }
});

export default router;
