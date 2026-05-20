import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const cookie = req.headers.cookie;

  if (!cookie) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  let token = cookie
    .split("; ")
    .find(row => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    token = cookie
      .split("; ")
      .find(row => row.startsWith("internIncharge_token="))
      ?.split("=")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
