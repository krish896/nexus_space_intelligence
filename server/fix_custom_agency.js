const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

mongoose.connect(process.env.MONGO_URL).then(async () => {
  // Old custom launches always have "ztm" in their customers array
  const result = await mongoose.connection.collection('launches').updateMany(
    { customers: { $in: ["ztm"] } },
    { $set: { agency: "CUSTOM" } }
  );
  console.log('Fixed', result.modifiedCount, 'old custom launch records → agency: CUSTOM');
  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
