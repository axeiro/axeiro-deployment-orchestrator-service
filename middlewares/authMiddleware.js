import jwt from "jsonwebtoken";

const requireUserAuth = (req, res, next) => {
  try {
    const token =
      req.cookies?.accesstoken ||
      (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      token,
      process.env.AUTH_SECRET_KEY
    );

    // Expect USER payload
    if (!decoded.id) {
      return res.status(401).json({ message: "Invalid user token" });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default requireUserAuth;
