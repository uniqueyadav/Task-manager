import express from "express";
import {
    createSubTask,
    createTask,
    dashboardStatistics,
    deleteRestoreTask,
    duplicateTask,
    getTask,
    getTasks,
    postTaskActivity,
    trashTask,
    updateTask,
} from "../controllers/taskController.js";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js";
// taskRoutes.js me top import line badlein:

const router = express.Router();

// Apply auth middleware to all task routes at once
router.use(protectRoute);


router.get("/dashboard", dashboardStatistics);
router.get("/", getTasks);


router.post("/create", isAdminRoute, createTask);
router.post("/duplicate/:id", isAdminRoute, duplicateTask);
router.post("/activity/:id", postTaskActivity);


router.put("/create-subtask/:id", isAdminRoute, createSubTask);
router.put("/update/:id", isAdminRoute, updateTask);
router.put("/trash/:id", isAdminRoute, trashTask);


router.get("/:id", getTask);


router.delete("/delete-restore/:id?", isAdminRoute, deleteRestoreTask);

export default router;