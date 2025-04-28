import bcrypt from 'bcryptjs';
import connectToDatabase from './db/mongoose';
import User from './db/models/user';

async function seedAdmin() {
  try {
    await connectToDatabase();
    
    // Check if admin user already exists
    const existingUser = await User.findOne({ username: 'admin' });
    
    if (existingUser) {
      console.log('Admin user already exists.');
      return;
    }
    
    // Create default admin user
    const password1Hash = await bcrypt.hash('password1', 12);
    const password2Hash = await bcrypt.hash('password2', 12);
    
    const user = new User({
      username: 'admin',
      password1Hash,
      password2Hash,
    });
    
    await user.save();
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

export { seedAdmin };