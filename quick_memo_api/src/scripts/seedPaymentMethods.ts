import pool from '../config/database.js';

const seedPaymentMethods = async () => {
  try {
    console.log('🌱 Seeding payment methods...');

    const paymentMethods = [
      'CASH',
      'CARD',
      'UPI',
      'ONLINE TRANSFER',
      'BANK TRANSFER'
    ];

    for (const method of paymentMethods) {
      await pool.query(
        `INSERT INTO payment_methods (name, is_active)
         VALUES ($1, TRUE)
         ON CONFLICT (name) DO NOTHING`,
        [method]
      );
      console.log(`✅ Added payment method: ${method}`);
    }

    console.log('✨ Payment methods seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding payment methods:', error);
    process.exit(1);
  }
};

seedPaymentMethods();
