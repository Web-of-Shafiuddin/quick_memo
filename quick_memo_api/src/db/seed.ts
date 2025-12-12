import { Pool, PoolClient } from "pg";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

// --- Database Connection ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- Helper Functions ---

/**
 * Truncates all tables in the correct order to respect foreign key constraints.
 */
async function truncateAllTables(client: PoolClient) {
  console.log("Truncating all tables...");
  // Order is important to avoid foreign key constraint violations
  const tables = [
    "invoices",
    "order_items",
    "order_headers",
    "payment_transactions",
    "subscriptions",
    "product_variant_attributes",
    "products",
    "categories",
    "customers",
    "payment_methods",
    "subscription_plans",
    "admins",
    "users",
  ];

  for (const table of tables) {
    await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`);
  }
  console.log("All tables truncated.");
}

/**
 * Generates a random integer between min and max (inclusive).
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Selects a random element from an array.
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns the current timestamp as an ISO string.
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

// --- Seeding Functions ---

async function seedUsers(client: PoolClient) {
  console.log("Seeding users...");
  const users = [];
  for (let i = 0; i < 5; i++) {
    const name = faker.person.fullName();
    users.push({
      email: faker.internet.email({
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1],
      }),
      name,
      password: "password123",
    });
  }
  const insertQuery =
    "INSERT INTO users (email, name, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING user_id;";
  for (const user of users) {
    const timestamp = getTimestamp();
    await client.query(insertQuery, [
      user.email,
      user.name,
      user.password,
      timestamp,
      timestamp,
    ]);
  }
  console.log(`${users.length} users seeded.`);
}

async function seedAdmins(client: PoolClient) {
  console.log("Seeding admins...");
  const admin = {
    email: "admin@example.com",
    name: "Super Admin",
    password: "adminpassword",
  };
  const timestamp = getTimestamp();
  await client.query(
    "INSERT INTO admins (email, name, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
    [admin.email, admin.name, admin.password, timestamp, timestamp]
  );
  console.log("1 admin seeded.");
}

async function seedSubscriptionPlans(client: PoolClient) {
  console.log("Seeding subscription plans...");
  const plans = [
    {
      name: "Free",
      monthly_price: 0,
      max_categories: 5,
      max_products: 20,
      max_orders_per_month: 50,
    },
    {
      name: "Basic",
      monthly_price: 19.99,
      max_categories: 20,
      max_products: 100,
      max_orders_per_month: 500,
    },
    {
      name: "Premium",
      monthly_price: 49.99,
      max_categories: -1,
      max_products: -1,
      max_orders_per_month: -1,
    },
  ];
  const insertQuery =
    "INSERT INTO subscription_plans (name, monthly_price, max_categories, max_products, max_orders_per_month, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)";
  for (const plan of plans) {
    const timestamp = getTimestamp();
    await client.query(insertQuery, [
      plan.name,
      plan.monthly_price,
      plan.max_categories,
      plan.max_products,
      plan.max_orders_per_month,
      timestamp,
      timestamp,
    ]);
  }
  console.log(`${plans.length} subscription plans seeded.`);
}

async function seedSubscriptions(client: PoolClient) {
  console.log("Seeding subscriptions...");
  const { rows: users } = await client.query("SELECT user_id FROM users");
  const { rows: plans } = await client.query(
    "SELECT plan_id FROM subscription_plans WHERE name != 'Free'"
  );

  for (const user of users) {
    const plan = pickRandom(plans);
    const startDate = faker.date.past({ years: 1 });
    const endDate = faker.date.future({ years: 1, refDate: startDate });
    const timestamp = getTimestamp();
    await client.query(
      "INSERT INTO subscriptions (user_id, plan_id, start_date, end_date, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        user.user_id,
        plan.plan_id,
        startDate,
        endDate,
        "ACTIVE",
        timestamp,
        timestamp,
      ]
    );
  }
  console.log(`${users.length} subscriptions seeded.`);
}

async function seedPaymentMethods(client: PoolClient) {
  console.log("Seeding payment methods...");
  const methods = ["CASH", "CARD", "BANK TRANSFER", "UPI", "PAYPAL"];
  const insertQuery =
    "INSERT INTO payment_methods (name, created_at, updated_at) VALUES ($1, $2, $3)";
  for (const method of methods) {
    const timestamp = getTimestamp();
    await client.query(insertQuery, [method, timestamp, timestamp]);
  }
  console.log(`${methods.length} payment methods seeded.`);
}

async function seedEcommerceData(client: PoolClient) {
  console.log("Seeding categories, products, customers, and orders...");
  const { rows: users } = await client.query("SELECT user_id FROM users");
  const { rows: paymentMethods } = await client.query(
    "SELECT payment_method_id FROM payment_methods"
  );
  const orderSources = ["OFFLINE", "FACEBOOK", "INSTAGRAM", "WEBSITE"];
  const orderStatuses = ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

  for (const user of users) {
    // Create Categories
    const categories = [];
    for (let i = 0; i < randomInt(2, 4); i++) {
      const timestamp = getTimestamp();

      // --- CORRECTED SECTION ---
      // Generate a base name and append a random string to ensure uniqueness
      const baseName = faker.commerce.department();
      const uniqueSuffix = faker.string.alphanumeric(5); // e.g., "a1b2c"
      const uniqueCategoryName = `${baseName} ${uniqueSuffix}`;
      // --- END CORRECTED SECTION ---

      const {
        rows: [newCategory],
      } = await client.query(
        "INSERT INTO categories (name, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING category_id",
        [uniqueCategoryName, user.user_id, timestamp, timestamp] // Use the unique name here
      );
      categories.push(newCategory);
    }

    // Create Products (including variants)
    let allProducts = [];
    for (const category of categories) {
      for (let i = 0; i < randomInt(3, 7); i++) {
        const productName = faker.commerce.productName();
        const timestamp = getTimestamp();
        const {
          rows: [baseProduct],
        } = await client.query(
          "INSERT INTO products (user_id, sku, name, category_id, price, stock, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING product_id",
          [
            user.user_id,
            `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
            productName,
            category.category_id,
            parseFloat(faker.commerce.price({ min: 10, max: 500, dec: 2 })),
            randomInt(0, 100),
            "ACTIVE",
            timestamp,
            timestamp,
          ]
        );
        allProducts.push(baseProduct);

        if (Math.random() > 0.5) {
          const colors = ["Red", "Blue", "Green", "Black", "White"];
          const sizes = ["S", "M", "L", "XL"];
          const numVariants = randomInt(2, 3);
          for (let j = 0; j < numVariants; j++) {
            const variantTimestamp = getTimestamp();
            const {
              rows: [variant],
            } = await client.query(
              "INSERT INTO products (user_id, sku, name, category_id, price, stock, status, parent_product_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING product_id",
              [
                user.user_id,
                `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
                productName,
                category.category_id,
                parseFloat(faker.commerce.price({ min: 10, max: 500, dec: 2 })),
                randomInt(0, 100),
                "ACTIVE",
                baseProduct.product_id,
                variantTimestamp,
                variantTimestamp,
              ]
            );
            allProducts.push(variant);
            await client.query(
              "INSERT INTO product_variant_attributes (product_id, attribute_name, attribute_value) VALUES ($1, $2, $3), ($1, $4, $5)",
              [
                variant.product_id,
                "Color",
                pickRandom(colors),
                "Size",
                pickRandom(sizes),
              ]
            );
          }
        }
      }
    }

    // Create Customers
    const customers = [];
    for (let i = 0; i < randomInt(5, 15); i++) {
      const timestamp = getTimestamp();
      const {
        rows: [newCustomer],
      } = await client.query(
        "INSERT INTO customers (user_id, name, email, mobile, address, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING customer_id",
        [
          user.user_id,
          faker.person.fullName(),
          faker.internet.email(),
          faker.phone.number({ style: "international" }),
          faker.location.streetAddress(),
          timestamp,
          timestamp,
        ]
      );
      customers.push(newCustomer);
    }

    // Create Orders (Headers and Items)
    for (let i = 0; i < randomInt(10, 30); i++) {
      const customer = pickRandom(customers);
      const orderDate = faker.date.past({ years: 1 });
      const orderSource = pickRandom(orderSources);
      const orderStatus = pickRandom(orderStatuses);
      const paymentMethod = pickRandom(paymentMethods);

      const numItems = randomInt(1, 4);
      const shippingAmount = parseFloat(
        faker.commerce.price({ min: 5, max: 15, dec: 2 })
      );

      let itemsTotal = 0;
      const itemsToInsert = [];
      for (let j = 0; j < numItems; j++) {
        const product = pickRandom(allProducts);
        const quantity = randomInt(1, 5);
        const unitPrice = parseFloat(
          faker.commerce.price({ min: 10, max: 500, dec: 2 })
        );
        const subtotal = quantity * unitPrice;
        itemsTotal += subtotal;
        itemsToInsert.push({ product, quantity, unitPrice, subtotal });
      }

      const taxAmount = itemsTotal * 0.08;
      const totalAmount = itemsTotal + shippingAmount + taxAmount;
      const orderTimestamp = getTimestamp();

      const {
        rows: [orderHeader],
      } = await client.query(
        `INSERT INTO order_headers (
          user_id, customer_id, order_date, order_source, order_status,
          payment_method_id, shipping_amount, tax_amount, total_amount, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING transaction_id`,
        [
          user.user_id,
          customer.customer_id,
          orderDate,
          orderSource,
          orderStatus,
          paymentMethod.payment_method_id,
          shippingAmount,
          taxAmount,
          totalAmount,
          orderTimestamp,
          orderTimestamp,
        ]
      );

      for (const item of itemsToInsert) {
        const itemTimestamp = getTimestamp();
        await client.query(
          `INSERT INTO order_items (
            transaction_id, product_id, name_snapshot, quantity, unit_price, subtotal, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            orderHeader.transaction_id,
            item.product.product_id,
            faker.commerce.productName(),
            item.quantity,
            item.unitPrice,
            item.subtotal,
            itemTimestamp,
            itemTimestamp,
          ]
        );
      }

      if (Math.random() > 0.2) {
        const invoiceNumber = `INV-${faker.date
          .past({ years: 1 })
          .getFullYear()}-${String(randomInt(1, 9999)).padStart(4, "0")}`;
        const issueDate = faker.date.past({ years: 1 });
        const dueDate = new Date(issueDate.getTime());
        dueDate.setDate(dueDate.getDate() + 30);
        const invoiceTimestamp = getTimestamp();

        await client.query(
          `INSERT INTO invoices (
            invoice_number, transaction_id, user_id, customer_id, issue_date, due_date, total_amount, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            invoiceNumber,
            orderHeader.transaction_id,
            user.user_id,
            customer.customer_id,
            issueDate,
            dueDate,
            totalAmount,
            "PAID",
            invoiceTimestamp,
            invoiceTimestamp,
          ]
        );
      }
    }
  }
  console.log("Ecommerce data seeded.");
}

// --- Main Seeding Logic ---
async function main() {
  const client = await pool.connect();
  try {
    await truncateAllTables(client);
    await seedUsers(client);
    await seedAdmins(client);
    await seedSubscriptionPlans(client);
    await seedSubscriptions(client);
    await seedPaymentMethods(client);
    await seedEcommerceData(client);
    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
