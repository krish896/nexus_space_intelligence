const users = require("./users.mongo");

async function findUserByGoogleId(googleId) {
  return await users.findOne({ googleId });
}

async function findUserById(id) {
  return await users.findById(id);
}

async function createUser(user) {
  try {
    return await users.create(user);
  } catch (err) {
    console.error(`Could not create user ${err}`);
  }
}

async function updateRefreshToken(googleId, refreshToken) {
  return await users.findOneAndUpdate(
    { googleId },
    { refreshToken },
    { new: true }
  );
}

module.exports = {
  findUserByGoogleId,
  findUserById,
  createUser,
  updateRefreshToken,
};
