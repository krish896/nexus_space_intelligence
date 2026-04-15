const { findUserById } = require("../../models/users.model");

async function httpGetProfile(req, res) {
  // `req.user` should be injected by `verifyToken` middleware
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Only return safe profile info
    return res.status(200).json({
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching profile" });
  }
}

module.exports = {
  httpGetProfile,
};
