const requireInternalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (token !== process.env.INTERNAL_SERVICE_TOKEN) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

export default requireInternalAuth;