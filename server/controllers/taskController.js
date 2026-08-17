import mongoose from "mongoose";
import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";

// Helper to check valid Mongo ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createTask = async(req, res) => {
    try {
        const { userId } = req.user;
        const { title, team, stage, date, priority, assets } = req.body;

        if (!title || !team || !date) {
            return res.status(400).json({ status: false, message: "Required fields are missing." });
        }

        let text = "New task has been assigned to you";
        if (team && team.length > 1) {
            text += ` and ${team.length - 1} others.`;
        }

        const taskPriority = priority ? priority.toLowerCase() : "normal";
        const taskStage = stage ? stage.toLowerCase() : "todo";

        text += ` The task priority is set at ${taskPriority} priority, check and act accordingly. Task date: ${new Date(date).toDateString()}.`;

        const activity = {
            type: "assigned",
            activity: text,
            by: userId,
        };

        const task = await Task.create({
            title,
            team,
            stage: taskStage,
            date,
            priority: taskPriority,
            assets,
            activities: [activity],
        });

        await Notice.create({
            team,
            text,
            task: task._id,
        });

        return res.status(201).json({
            status: true,
            task,
            message: "Task created successfully.",
        });
    } catch (error) {
        console.error("createTask Error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const duplicateTask = async(req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ status: false, message: "Invalid Task ID" });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found" });
        }

        // Clean subtasks to avoid duplicating Mongoose ObjectIds
        const clonedSubTasks = task.subTasks.map((st) => ({
            title: st.title,
            date: st.date,
            tag: st.tag,
        }));

        const newTask = await Task.create({
            title: `${task.title} - Duplicate`,
            team: task.team,
            subTasks: clonedSubTasks,
            assets: task.assets,
            priority: task.priority,
            stage: task.stage,
            date: task.date,
        });

        let text = "New task has been assigned to you";
        if (task.team && task.team.length > 1) {
            text += ` and ${task.team.length - 1} others.`;
        }

        text += ` The task priority is set at ${task.priority} priority. Task date: ${new Date(task.date).toDateString()}.`;

        await Notice.create({
            team: task.team,
            text,
            task: newTask._id,
        });

        return res.status(200).json({
            status: true,
            message: "Task duplicated successfully.",
        });
    } catch (error) {
        console.error("duplicateTask Error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const postTaskActivity = async(req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const { type, activity } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ status: false, message: "Invalid Task ID" });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found" });
        }

        const data = {
            type,
            activity,
            by: userId,
        };

        task.activities.push(data);
        await task.save();

        return res.status(200).json({
            status: true,
            message: "Activity posted successfully.",
        });
    } catch (error) {
        console.error("postTaskActivity Error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const dashboardStatistics = async(req, res) => {
    try {
        const { userId, isAdmin } = req.user;

        const taskQuery = isAdmin ?
            { isTrashed: false } :
            { isTrashed: false, team: { $in: [userId] } };

        // Parallel processing for optimal database fetch times
        const [allTasks, users] = await Promise.all([
            Task.find(taskQuery)
            .populate({ path: "team", select: "name role title email" })
            .sort({ _id: -1 }),
            isAdmin ?
            User.find({ isActive: true })
            .select("name title role isAdmin createdAt")
            .limit(10)
            .sort({ _id: -1 }) :
            Promise.resolve([]),
        ]);

        const groupTasks = allTasks.reduce((result, task) => {
            const stage = task.stage || "todo";
            result[stage] = (result[stage] || 0) + 1;
            return result;
        }, {});

        const groupData = Object.entries(
            allTasks.reduce((result, task) => {
                const priority = task.priority || "normal";
                result[priority] = (result[priority] || 0) + 1;
                return result;
            }, {})
        ).map(([name, total]) => ({ name, total }));

        const summary = {
            totalTasks: allTasks.length,
            last10Task: allTasks.slice(0, 10),
            users,
            tasks: groupTasks,
            graphData: groupData,
        };

        return res.status(200).json({
            status: true,
            message: "Successfully fetched dashboard statistics",
            ...summary,
        });
    } catch (error) {
        console.error("dashboardStatistics Error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getTasks = async(req, res) => {
    try {
        const { userId, isAdmin } = req.user;
        const { stage, isTrashed } = req.query;

        const query = { isTrashed: isTrashed === "true" };

        if (stage) {
            query.stage = stage;
        }

        if (!isAdmin) {
            query.team = { $in: [userId] };
        }

        const tasks = await Task.find(query)
            .populate({ path: "team", select: "name title email" })
            .sort({ _id: -1 });

        return res.status(200).json({
            status: true,
            tasks,
        });
    } catch (error) {
        console.error("getTasks Error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const getTask = async(req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ status: false, message: "Invalid Task ID" });
        }

        const task = await Task.findById(id)
            .populate({ path: "team", select: "name title role email" })
            .populate({ path: "activities.by", select: "name" });

        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found" });
        }

        return res.status(200).json({
            status: true,
            task,
        });
    } catch (error) {
        console.error("getTask Error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const createSubTask = async(req, res) => {
    try {
        const { title, tag, date } = req.body;
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ status: false, message: "Invalid Task ID" });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found" });
        }

        task.subTasks.push({ title, date, tag });
        await task.save();

        return res.status(200).json({
            status: true,
            message: "SubTask added successfully.",
        });
    } catch (error) {
        console.error("createSubTask Error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const updateTask = async(req, res) => {
    try {
        const { id } = req.params;
        const { title, date, team, stage, priority, assets } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ status: false, message: "Invalid Task ID" });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found" });
        }

        task.title = title || task.title;
        task.date = date || task.date;
        task.priority = priority ? priority.toLowerCase() : task.priority;
        task.assets = assets || task.assets;
        task.stage = stage ? stage.toLowerCase() : task.stage;
        task.team = team || task.team;

        await task.save();

        return res.status(200).json({
            status: true,
            message: "Task updated successfully.",
        });
    } catch (error) {
        console.error("updateTask Error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const trashTask = async(req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ status: false, message: "Invalid Task ID" });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ status: false, message: "Task not found" });
        }

        task.isTrashed = true;
        await task.save();

        return res.status(200).json({
            status: true,
            message: "Task moved to trash successfully.",
        });
    } catch (error) {
        console.error("trashTask Error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};

export const deleteRestoreTask = async(req, res) => {
    try {
        const { id } = req.params;
        const { actionType } = req.query;

        if (["delete", "restore"].includes(actionType)) {
            if (!id || !isValidObjectId(id)) {
                return res.status(400).json({ status: false, message: "Valid Task ID is required." });
            }
        }

        if (actionType === "delete") {
            await Task.findByIdAndDelete(id);
        } else if (actionType === "deleteAll") {
            await Task.deleteMany({ isTrashed: true });
        } else if (actionType === "restore") {
            await Task.findByIdAndUpdate(id, { isTrashed: false });
        } else if (actionType === "restoreAll") {
            await Task.updateMany({ isTrashed: true }, { $set: { isTrashed: false } });
        } else {
            return res.status(400).json({ status: false, message: "Invalid actionType parameter." });
        }

        return res.status(200).json({
            status: true,
            message: "Operation performed successfully.",
        });
    } catch (error) {
        console.error("deleteRestoreTask Error:", error);
        return res.status(500).json({ status: false, message: error.message });
    }
};