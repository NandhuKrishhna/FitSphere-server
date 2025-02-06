const bcrypt = require('bcryptjs');

// Original password
const originalPassword = 'admin12345';

// Hash the password using bcrypt
const hashedPassword = bcrypt.hashSync(originalPassword, 10);

// Admin data
const adminData = {
  _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
  name: 'Admin User',
  email: 'admin@example.com',
  password: hashedPassword,
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log('Original Password:', originalPassword);
console.log('Hashed Password:', hashedPassword);
console.log('Admin Data:', adminData);
