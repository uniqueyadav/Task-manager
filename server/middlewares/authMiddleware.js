import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protectRoute = async(req, res, next) => {
    try {
        let token;

        // 1. Authorization Header check karo (Bearer Token)
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        // 2. Cookie check without optional chaining (Safe & Clean)
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // Agar token dono jagah me se kahin na mile
        if (!token) {
            return res
                .status(401)
                .json({ status: false, message: "Not authorized. Try login again." });
        }

        // Token verify karo
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // DB me User check karo
        const user = await User.findById(decodedToken.userId).select("isAdmin email");

        if (!user) {
            return res
                .status(401)
                .json({ status: false, message: "User not found. Try login again." });
        }

        req.user = {
            email: user.email,
            isAdmin: user.isAdmin,
            userId: decodedToken.userId,
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res
            .status(401)
            .json({ status: false, message: "Not authorized. Try login again." });
    }
};

const isAdminRoute = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(401).json({
            status: false,
            message: "Not authorized as admin. Try login as admin.",
        });
    }
};

export { isAdminRoute, protectRoute };