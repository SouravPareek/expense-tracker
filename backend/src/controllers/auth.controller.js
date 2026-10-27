import { findByEmail, findById, createUser } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SYSTEM_USER_ID } from "../config/constants.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
};

const DUMMY_HASH = await bcrypt.hash("dummy-password", 10);

export async function registerController(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({ message: "Invalid input" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();

        if (!trimmedName || !normalizedEmail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (trimmedName.length > 100) {
            return res
                .status(400)
                .json({ message: "Name must be at most 100 characters" });
        }
        if (normalizedEmail.length > 255) {
            return res.status(400).json({ message: "Email is too long" });
        }
        if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
            return res
                .status(400)
                .json({ message: "Password must be 8 to 72 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address",
            });
        }

        const existingUser = await findByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const userId = await createUser(trimmedName, normalizedEmail, password_hash);
        const token = jwt.sign(
            {
                id: userId,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" },
        );

        res.cookie("token", token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: userId,
                name: trimmedName,
                email: normalizedEmail,
            },
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "User already exists" });
        }
        next(error);
    }
}

export async function loginController(req, res, next) {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({ message: "Invalid input" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (normalizedEmail.length > 255 || Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address",
            });
        }

        const user = await findByEmail(normalizedEmail);

        const isBlocked = !user || user.id === SYSTEM_USER_ID;
        const hashToCheck = isBlocked ? DUMMY_HASH : user.password_hash;
        const isPasswordValid = await bcrypt.compare(password, hashToCheck);

        if (isBlocked || !isPasswordValid) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            {
                id: user.id,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" },
        );

        res.cookie("token", token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "User LoggedIn successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        next(err);
    }
}

export function logoutController(req, res) {
    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
        message: "user logged out successfully.",
    });
}

export async function getMe(req, res, next) {
    try {
        const userid = req.user.id;

        const user = await findById(userid);

        if (!user) {
            res.clearCookie("token", cookieOptions);

            return res.status(401).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        next(err);
    }
}
