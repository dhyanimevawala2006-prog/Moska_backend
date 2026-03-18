// Run: node makeAdmin.js <email>
// Example: node makeAdmin.js admin@example.com

const mongoose = require('mongoose');
const User = require('./models/userModel');

const email = process.argv[2];
if (!email) { console.log('Usage: node makeAdmin.js <email>'); process.exit(1); }

mongoose.connect('mongodb://localhost:27017/estore').then(async () => {
  const user = await User.findOneAndUpdate({ email }, { isAdmin: true }, { new: true });
  if (!user) { console.log('User not found:', email); }
  else { console.log('✅ isAdmin set to true for:', user.email); }
  mongoose.disconnect();
}).catch(err => { console.error(err); process.exit(1); });
