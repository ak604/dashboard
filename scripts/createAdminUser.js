require('dotenv').config();
const { userService } = require('../services/userService');
const { v4: uuidv4 } = require('uuid');

const createAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME;
    const contextId = process.env.ADMIN_CONTEXT_ID;
    
    if (!adminEmail || !adminName || !contextId) {
      console.error('Required environment variables: ADMIN_EMAIL, ADMIN_NAME, ADMIN_CONTEXT_ID');
      process.exit(1);
    }
    
    // Check if admin user already exists
    const existingUser = await userService.getUserByEmail(adminEmail);
    if (existingUser) {
      console.log('Admin user already exists, updating access level...');
      existingUser.accessLevel = 'ADMIN';
      await userService.updateUser(existingUser);
      console.log('Admin access level updated successfully');
      return;
    }
    
    // Create new admin user
    const userId = uuidv4();
    const adminUser = {
      userId,
      contextId,
      email: adminEmail,
      name: adminName,
      accessLevel: 'ADMIN',
      createdAt: new Date().toISOString()
    };
    
    await userService.updateUser(adminUser);
    console.log(`Admin user created with ID: ${userId}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser(); 