import jwt from "jsonwebtoken";
import InternIncharge from "../models/InternHead.js";

export const protectInternIncharge = async (req, res, next) => {
  try {
    const token =
      req.cookies?.internIncharge_token ||
      req.headers.cookie?.split("internIncharge_token=")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch user from DB (without password)
    const incharge = await InternIncharge.findById(decoded.id).select("-password");

    if (!incharge) {
      return res.status(404).json({
        success: false,
        message: "Intern Incharge not found",
      });
    }

    // ✅ Attach user to request for next middleware
    req.user = incharge;
    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized or token invalid",
    });
  }
};
