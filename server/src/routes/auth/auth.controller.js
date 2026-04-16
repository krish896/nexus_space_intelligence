const jwt = require("jsonwebtoken");
const { updateRefreshToken, findUserById } = require("../../models/users.model");
const { generateAccessToken, generateRefreshToken, config } = require("../../services/auth");

// The /auth/google endpoint just redirects, handled directly in router.

async function httpCallback(req, res) {
  // Successful authentication, issue tokens
  const user = req.user;
  
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save the refresh token to the DB so we can revoke it if needed
  await updateRefreshToken(user.googleId, refreshToken);

  // Send the refresh token in a secure, HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // the client is running on port 3000
  // we redirect them to the client root, but we need to pass the access token. 
  // It's safer to not put it in the URL. Since they will load the app, they can instantly call /auth/refresh to get an access token.
  res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/`);
}

async function httpRefresh(req, res) {
  const refreshToken = req.cookies?.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: "Unauthorized: No refresh token" });
  }

  try {
    const verified = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    
    // Check if the user exists and the token matches the DB (added security layer)
    const user = await findUserById(verified.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: "Forbidden: Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update DB
    await updateRefreshToken(user.googleId, newRefreshToken);

    // Issue new cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: newAccessToken, profile: { name: user.name, email: user.email } });
  } catch (err) {
    return res.status(403).json({ error: "Forbidden: Token expired or invalid" });
  }
}

async function httpLogout(req, res) {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    try {
      const verified = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      await updateRefreshToken(verified.googleId, null); // Invalidate token in DB
    } catch (err) {
      // Ignored if expired already
    }
  }

  // Clear cookie
  res.clearCookie("refreshToken");
  req.logout && req.logout((err) => {
    if (err) console.error(err);
  });
  
  return res.status(200).json({ message: "Logged out successfully" });
}

module.exports = {
  httpCallback,
  httpRefresh,
  httpLogout,
};
