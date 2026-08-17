import express from "express";
import {
    activateUserProfile,
    changeUserPassword,
    deleteUserProfile,
    deleteRestoreUser,
    getNotificationsList,
    getTeamList,
    loginUser,
    logoutUser,
    markNotificationRead,
    registerUser,
    updateUserProfile,
} from "../controllers/userController.js";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected Routes / User Routes
router.get("/get-team", protectRoute, isAdminRoute, getTeamList);
router.get("/notifications", protectRoute, getNotificationsList);

router.put("/profile", protectRoute, updateUserProfile);
router.put("/read-noti", protectRoute, markNotificationRead);
router.put("/change-password", protectRoute, changeUserPassword);

// Admin Routes
router.post("/register", protectRoute, isAdminRoute, registerUser);
router.delete(
    "/delete-restore/:id?",
    protectRoute,
    isAdminRoute,
    deleteRestoreUser
);

// Dynamic Param Routes (Must remain at the bottom)
router
    .route("/:id")
    .put(protectRoute, isAdminRoute, activateUserProfile)
    .delete(protectRoute, isAdminRoute, deleteUserProfile);

export default router;