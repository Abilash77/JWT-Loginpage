import User from "../models/User.js";
// bcrypt not needed for fixed admin login
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateAccessToken, generateRefreshToken } from "../token.js";
dotenv.config();
// Registration disabled

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fixed admin credentials
    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "admin@123";

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken("admin-fixed-id");
    const refreshToken = generateRefreshToken("admin-fixed-id");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "Login Successfull",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access Token missing" });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    // If using fixed admin, just return a minimal admin profile
    if (decoded.userId === "admin-fixed-id") {
      return res.status(200).json({
        name: "Administrator",
        email: "admin@example.com",
        mobile: "",
        role: "admin",
      });
    }
    // Fallback to user lookup if any other id
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(200).json(user);
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired access token", error });
  }
};
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token missing" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    // Support fixed admin without DB lookup
    if (decoded.userId === "admin-fixed-id") {
      const newAccessToken = generateAccessToken("admin-fixed-id");
      return res.status(200).json({ accessToken: newAccessToken });
    }
    const user = await User.findById(decoded.userId);
    const newAccessToken = generateAccessToken(user._id);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token", error });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
