#!/usr/bin/env node

import crypto from 'crypto';

const API_URL = "https://zira-tech.com/api.php";

// Simple password hashing (in production, use bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function makeRequest(method, tableName, payload = null) {
  try {
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (payload) {
      options.body = JSON.stringify(payload);
    }

    const url = tableName ? `${API_URL}?table=${tableName}` : API_URL;
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error(`Error making ${method} request to ${tableName}:`, error.message);
    throw error;
  }
}

async function createUsersTable() {
  console.log("📦 Creating users table...");

  const payload = {
    create_table: true,
    columns: {
      id: "INT AUTO_INCREMENT PRIMARY KEY",
      email: "VARCHAR(255) NOT NULL UNIQUE",
      password_hash: "VARCHAR(255) NOT NULL",
      full_name: "VARCHAR(255)",
      status: "VARCHAR(50) DEFAULT 'active'",
      last_login_at: "TIMESTAMP NULL",
      created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    }
  };

  try {
    const result = await makeRequest("POST", "users", payload);
    console.log("✅ Users table created successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to create users table:", error.message);
    return false;
  }
}

async function createUserRolesTable() {
  console.log("📦 Creating user_roles table...");

  const payload = {
    create_table: true,
    columns: {
      id: "INT AUTO_INCREMENT PRIMARY KEY",
      user_id: "INT NOT NULL UNIQUE",
      role: "VARCHAR(50) DEFAULT 'user'",
      created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    }
  };

  try {
    const result = await makeRequest("POST", "user_roles", payload);
    console.log("✅ User roles table created successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to create user_roles table:", error.message);
    return false;
  }
}

async function seedAdminUser() {
  console.log("🌱 Seeding admin user...");

  const adminEmail = "info@zirattech.com";
  const adminPassword = "Password123";
  const passwordHash = hashPassword(adminPassword);

  try {
    // Create admin user
    const userResult = await makeRequest("POST", "users", {
      email: adminEmail,
      password_hash: passwordHash,
      full_name: "Admin User",
      status: "active"
    });

    if (!userResult.id) {
      throw new Error("Failed to get user ID from response");
    }

    console.log(`✅ Admin user created with ID: ${userResult.id}`);

    // Assign admin role
    const roleResult = await makeRequest("POST", "user_roles", {
      user_id: userResult.id,
      role: "admin"
    });

    console.log(`✅ Admin role assigned to user`);
    console.log(`\n📧 Admin Credentials:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);

  } catch (error) {
    console.error("❌ Failed to seed admin user:", error.message);
    throw error;
  }
}

async function setup() {
  console.log("🚀 Starting authentication setup...\n");

  try {
    const usersTableCreated = await createUsersTable();
    if (!usersTableCreated) {
      console.error("\n❌ Failed to create users table");
      process.exit(1);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const rolesTableCreated = await createUserRolesTable();
    if (!rolesTableCreated) {
      console.error("\n❌ Failed to create user_roles table");
      process.exit(1);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    await seedAdminUser();

    console.log("\n✨ Authentication setup completed successfully!");
    console.log("🔐 You can now login with the admin credentials above.\n");
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    process.exit(1);
  }
}

setup();
