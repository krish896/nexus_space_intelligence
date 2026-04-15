const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

mongoose.connect(process.env.MONGO_URL).then(async () => {
  const result = await mongoose.connection.collection('launchdetails').deleteMany({
    flightNumber: { $gte: 10000 }
  });
  console.log('Cleared', result.deletedCount, 'cached LL2 detail entries');
  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
// not needed 
