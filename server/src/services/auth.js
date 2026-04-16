const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const { findUserByGoogleId, createUser } = require("../models/users.model");

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const config = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET || "super_secret_jwt_key",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "super_secret_refresh_key",
  CALLBACK_URL: `${process.env.BASE_URL || "http://localhost:8001"}/auth/google/callback`,
};

// Setting up Google Strategy — only if credentials are present
if (config.CLIENT_ID && config.CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.CLIENT_ID,
        clientSecret: config.CLIENT_SECRET,
        callbackURL: config.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await findUserByGoogleId(profile.id);

          if (!user) {
            // Register the new user
            const email = profile.emails[0].value;
            const name = profile.displayName;
            user = await createUser({
              googleId: profile.id,
              email,
              name,
            });
          }
          
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
} else {
  console.warn("[Auth] WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing — OAuth disabled.");
}

// Middleware to verify JWT tokens
function verifyToken(req, res, next) {
  // Bypass auth for test environment
  if (process.env.NODE_ENV === "test") return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing Token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const verified = jwt.verify(token, config.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Unauthorized: Token Expired" });
    }
    return res.status(401).json({ error: "Unauthorized: Invalid Token" });
  }
}

// Token Generation
function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, googleId: user.googleId, email: user.email },
    config.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id, googleId: user.googleId },
    config.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = {
  passport,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  config,
};
