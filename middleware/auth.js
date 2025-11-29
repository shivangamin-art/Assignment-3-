// middleware/auth.js
// Ensures only authenticated users can access protected routes

module.exports.ensureAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // For assignment: block with a simple message or redirect
  res.status(403).send('You must be logged in to perform this action.');
};
