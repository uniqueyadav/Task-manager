import Notice from "../models/notification.js";
import User from "../models/user.js";
import { createJWT } from "../utils/index.js";

// 1. REGISTER USER / ADD TEAM MEMBER
export const registerUser = async(req, res) => {
    try {
        const { name, email, password, isAdmin, role, title } = req.body;

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({
                status: false,
                message: "User already exists",
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            isAdmin: isAdmin || false,
            role: role || "Employee",
            title: title || "Team Member",
        });

        if (user) {
            if (!req.user) {
                createJWT(res, user._id);
            }

            user.password = undefined;

            return res.status(201).json({
                status: true,
                message: "User registered successfully",
                user,
            });
        } else {
            return res
                .status(400)
                .json({ status: false, message: "Invalid user data" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};

// 2. LOGIN USER
export const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, isTrashed: { $ne: true } });

        if (!user) {
            return res
                .status(401)
                .json({ status: false, message: "Invalid email or password." });
        }

        if (!user.isActive) {
            return res.status(401).json({
                status: false,
                message: "User account has been deactivated, contact the administrator",
            });
        }

        const isMatch = await user.matchPassword(password);

        if (user && isMatch) {
            createJWT(res, user._id);

            user.password = undefined;

            return res.status(200).json(user);
        } else {
            return res
                .status(401)
                .json({ status: false, message: "Invalid email or password" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};

// 3. LOGOUT USER
export const logoutUser = async(req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
        });

        return res.status(200).json({ status: true, message: "Logout successful" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};

// 4. GET TEAM LIST
export const getTeamList = async(req, res) => {
    try {
        const isTrashed = req.query.isTrashed === "true";

        const queryFilter = isTrashed ? { isTrashed: true } : { isTrashed: { $ne: true } };

        const users = await User.find(queryFilter)
            .select("_id name title role email isActive isAdmin createdAt isTrashed")
            .sort({ _id: -1 });

        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};

// 5. GET NOTIFICATIONS LIST
export const getNotificationsList = async(req, res) => {
    try {
        const { userId } = req.user;

        const notice = await Notice.find({
                team: userId,
                isRead: { $nin: [userId] },
            })
            .populate("task", "title")
            .sort({ createdAt: -1 });

        return res.status(200).json(notice);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};

// 6. UPDATE USER PROFILE
export const updateUserProfile = async(req, res) => {
    try {
        const { userId, isAdmin } = req.user;
        const { _id, name, title, role, email, password } = req.body;

        const id = isAdmin && _id ? _id : userId;

        const user = await User.findById(id);

        if (user) {
            user.name = name || user.name;
            user.title = title || user.title;
            user.role = role || user.role;
            user.email = email || user.email;

            if (password) {
                user.password = password;
            }

            const updatedUser = await user.save();

            updatedUser.password = undefined;

            return res.status(200).json({
                status: true,
                message: "Profile Updated Successfully.",
                user: updatedUser,
            });
        } else {
            return res.status(404).json({ status: false, message: "User not found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};

// 7. MARK NOTIFICATION AS READ
export const markNotificationRead = async(req, res) => {
    try {
        const { userId } = req.user;
        const { isReadType, id } = req.query;

        if (isReadType === "all") {
            await Notice.updateMany({ team: userId, isRead: { $nin: [userId] } }, { $push: { isRead: userId } }, { new: true });
        } else {
            await Notice.findOneAndUpdate({ _id: id, isRead: { $nin: [userId] } }, { $push: { isRead: userId } }, { new: true });
        }

        return res.status(200).json({ status: true, message: "Done" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};

// 8. CHANGE PASSWORD
export const changeUserPassword = async(req, res) => {
    try {
        const { userId } = req.user;

        const user = await User.findById(userId);

        if (user) {
            user.password = req.body.password;

            await user.save();

            user.password = undefined;

            return res.status(200).json({
                status: true,
                message: `Password changed successfully.`,
            });
        } else {
            return res.status(404).json({ status: false, message: "User not found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};

// 9. ACTIVATE/DISABLE USER PROFILE
export const activateUserProfile = async(req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (user) {
            user.isActive =
                req.body.isActive !== undefined ? req.body.isActive : !user.isActive;

            await user.save();

            return res.status(200).json({
                status: true,
                message: `User account has been ${
          user.isActive ? "activated" : "disabled"
        }`,
            });
        } else {
            return res.status(404).json({ status: false, message: "User not found" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};

// 10. SOFT DELETE USER
export const deleteUserProfile = async(req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id, { isTrashed: true }, { new: true }
        );

        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        return res
            .status(200)
            .json({ status: true, message: "User moved to trash successfully" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};

// 11. RESTORE OR PERMANENTLY DELETE USER FROM TRASH
export const deleteRestoreUser = async(req, res) => {
    try {
        const { id } = req.params;
        const { actionType } = req.query;

        if (actionType === "delete") {
            await User.findByIdAndDelete(id);
            return res
                .status(200)
                .json({ status: true, message: "User permanently deleted." });
        } else if (actionType === "restore") {
            await User.findByIdAndUpdate(id, { isTrashed: false });
            return res
                .status(200)
                .json({ status: true, message: "User restored successfully." });
        } else if (actionType === "restoreAll") {
            await User.updateMany({ isTrashed: true }, { isTrashed: false });
            return res
                .status(200)
                .json({ status: true, message: "All users restored successfully." });
        } else if (actionType === "deleteAll") {
            await User.deleteMany({ isTrashed: true });
            return res
                .status(200)
                .json({ status: true, message: "All trashed users permanently deleted." });
        }

        return res
            .status(400)
            .json({ status: false, message: "Invalid action type" });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: false, message: error.message });
    }
};