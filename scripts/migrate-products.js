#!/usr/bin/env node

/**
 * Products Table Migration Script
 * Creates the products table in MySQL via the PHP API
 * and seeds it with sample data
 */

const API_URL = process.env.API_URL || "https://zira-tech.com/api.php";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const TABLE_NAME = "products";

const sampleProducts = [
  {
    name: "Zira Web Pro",
    description: "Professional website builder for African businesses with local payment integration",
    price: "99.99",
    image_url: "https://images.unsplash.com/photo-1460925895917-adf4e0c6e9e2?w=500&h=300&fit=crop",
    category: "Enterprise",
    is_featured: 1,
    featured_order: 1
  },
  {
    name: "Zira SMS Campaigns",
    description: "Bulk SMS marketing platform with advanced analytics and scheduling",
    price: "49.99",
    image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    category: "Marketing",
    is_featured: 1,
    featured_order: 2
  },
  {
    name: "Zira Homes CRM",
    description: "Real estate management system designed for African property companies",
    price: "149.99",
    image_url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&h=300&fit=crop",
    category: "Real Estate",
    is_featured: 1,
    featured_order: 3
  },
  {
    name: "Zira Lock Security",
    description: "Enterprise-grade access control and security management platform",
    price: "199.99",
    image_url: "https://images.unsplash.com/photo-1526374965328-7f5ae4e8a84e?w=500&h=300&fit=crop",
    category: "Security",
    is_featured: 1,
    featured_order: 4
  }
];

async function makeRequest(method, payload = null) {
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

    const response = await fetch(`${API_URL}?table=${TABLE_NAME}`, options);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error(`Error making ${method} request:`, error.message);
    throw error;
  }
}

async function createTable() {
  console.log("📦 Creating products table...");

  const payload = {
    create_table: true,
    columns: {
      id: "INT AUTO_INCREMENT PRIMARY KEY",
      name: "VARCHAR(255) NOT NULL",
      description: "TEXT",
      price: "DECIMAL(10,2)",
      image_url: "TEXT",
      category: "VARCHAR(255)",
      is_featured: "BOOLEAN DEFAULT FALSE",
      featured_order: "INT",
      created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    }
  };

  try {
    const result = await makeRequest("POST", payload);
    console.log("✅ Products table created successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to create table:", error.message);
    return false;
  }
}

async function seedData() {
  console.log("🌱 Seeding sample products...");

  for (const product of sampleProducts) {
    try {
      const result = await makeRequest("POST", product);
      console.log(`✅ Added product: ${product.name}`);
    } catch (error) {
      console.error(`❌ Failed to add product ${product.name}:`, error.message);
    }
  }

  console.log("🎉 Seeding complete!");
}

async function migrate() {
  console.log("🚀 Starting products table migration...\n");

  try {
    const tableCreated = await createTable();

    if (tableCreated) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      await seedData();
      console.log("\n��� Migration completed successfully!");
    } else {
      console.log("\n⚠️  Table creation failed. Skipping seeding.");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
