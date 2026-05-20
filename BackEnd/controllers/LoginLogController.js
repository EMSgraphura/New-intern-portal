import LoginLog from "../models/LoginLog.js";

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || req.ip || "Unknown";
};

export const validateLocationMeta = (loginMeta) => {
  if (!loginMeta) return "Location access is required for login.";
  const latitude = Number(loginMeta.latitude);
  const longitude = Number(loginMeta.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return "Location access is required for login.";
  }
  return null;
};

export const logLoginActivity = async ({ req, username, email, role, loginMeta }) => {
  await LoginLog.create({
    username,
    email,
    role,
    latitude: Number(loginMeta.latitude),
    longitude: Number(loginMeta.longitude),
    ipAddress: loginMeta?.ipAddress || getClientIp(req),
    deviceType: loginMeta?.deviceType || "Unknown",
    browserDetails: loginMeta?.browserDetails || "Unknown",
    userAgent: loginMeta?.userAgent || req.headers["user-agent"] || "Unknown",
    loginAt: new Date(),
  });
};

export const getLoginLogs = async (req, res) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({ message: "Only admin can view login logs." });
    }

    const { startDate, endDate, search } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.loginAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.loginAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.loginAt.$lte = end;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { role: searchRegex },
        { ipAddress: searchRegex },
        { deviceType: searchRegex },
        { browserDetails: searchRegex },
      ];
    }

    const logs = await LoginLog.find(query).sort({ loginAt: -1 }).limit(2000);
    res.status(200).json({ logs });
  } catch (error) {
    console.error("Error fetching login logs:", error);
    res.status(500).json({ message: "Failed to fetch login logs." });
  }
};
