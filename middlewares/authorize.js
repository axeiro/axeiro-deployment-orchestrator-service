

export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user?.permissions?.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    } catch (err) {
      return res.status(500).json({ message: 'Authorization failed' });
    }
  };
};
