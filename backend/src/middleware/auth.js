const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  const userRole = req.user?.role?.toLowerCase()?.trim();
  console.log(`[AuthMiddleware] Verifying Admin role. Current: '${req.user?.role}' (Sanitized: '${userRole}')`);

  if (userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admin privileges required." });
  }
};

module.exports = { verifyToken, isAdmin };