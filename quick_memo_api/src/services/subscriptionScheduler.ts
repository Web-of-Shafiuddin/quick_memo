import pool from '../config/database.js';

// Grace period in days (can be configured per subscription)
const DEFAULT_GRACE_PERIOD_DAYS = 7;

// Warning days before expiration
const EXPIRY_WARNING_DAYS = [7, 3, 1];

interface ExpiredSubscription {
  subscription_id: number;
  user_id: number;
  plan_id: number;
  end_date: Date;
  status: string;
  grace_period_days: number;
  grace_period_end: Date | null;
  user_name: string;
  user_email: string;
  plan_name: string;
}

interface ExpiringSubscription {
  subscription_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  plan_name: string;
  end_date: Date;
  days_until_expiry: number;
}

/**
 * Update subscriptions that have passed their end_date to EXPIRED status
 * Also handles grace period logic
 */
export const processExpiredSubscriptions = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Find active subscriptions that have passed their end_date but haven't entered grace period
    const expiredResult = await client.query<ExpiredSubscription>(`
      SELECT
        s.subscription_id, s.user_id, s.plan_id, s.end_date, s.status,
        COALESCE(s.grace_period_days, $1) as grace_period_days,
        s.grace_period_end,
        u.name as user_name, u.email as user_email,
        sp.name as plan_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.user_id
      JOIN subscription_plans sp ON s.plan_id = sp.plan_id
      WHERE s.status = 'ACTIVE'
        AND s.end_date < NOW()
        AND s.grace_period_end IS NULL
    `, [DEFAULT_GRACE_PERIOD_DAYS]);

    // Start grace period for newly expired subscriptions
    for (const sub of expiredResult.rows) {
      const gracePeriodEnd = new Date(sub.end_date);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + sub.grace_period_days);

      // Update subscription with grace period end date
      await client.query(`
        UPDATE subscriptions
        SET grace_period_end = $1, status = 'GRACE_PERIOD', updated_at = NOW()
        WHERE subscription_id = $2
      `, [gracePeriodEnd, sub.subscription_id]);

      // Create notification for grace period start
      await client.query(`
        INSERT INTO notifications (user_id, type, title, message, metadata)
        VALUES ($1, 'SUBSCRIPTION_GRACE_PERIOD', $2, $3, $4)
      `, [
        sub.user_id,
        'Subscription Grace Period Started',
        `Your ${sub.plan_name} subscription has expired. You have ${sub.grace_period_days} days to renew before losing access to premium features.`,
        JSON.stringify({
          subscription_id: sub.subscription_id,
          plan_name: sub.plan_name,
          grace_period_days: sub.grace_period_days,
          grace_period_end: gracePeriodEnd.toISOString()
        })
      ]);

      console.log(`[Scheduler] Started grace period for user ${sub.user_id} (${sub.user_email})`);
    }

    // 2. Find subscriptions whose grace period has ended
    const gracePeriodEndedResult = await client.query<ExpiredSubscription>(`
      SELECT
        s.subscription_id, s.user_id, s.plan_id,
        u.name as user_name, u.email as user_email,
        sp.name as plan_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.user_id
      JOIN subscription_plans sp ON s.plan_id = sp.plan_id
      WHERE s.status = 'GRACE_PERIOD'
        AND s.grace_period_end < NOW()
    `);

    // Mark subscriptions as fully expired
    for (const sub of gracePeriodEndedResult.rows) {
      await client.query(`
        UPDATE subscriptions
        SET status = 'EXPIRED', updated_at = NOW()
        WHERE subscription_id = $1
      `, [sub.subscription_id]);

      // Create notification for full expiration
      await client.query(`
        INSERT INTO notifications (user_id, type, title, message, metadata)
        VALUES ($1, 'SUBSCRIPTION_EXPIRED', $2, $3, $4)
      `, [
        sub.user_id,
        'Subscription Expired',
        `Your ${sub.plan_name} subscription has fully expired. Please renew to continue using premium features.`,
        JSON.stringify({
          subscription_id: sub.subscription_id,
          plan_name: sub.plan_name
        })
      ]);

      console.log(`[Scheduler] Subscription fully expired for user ${sub.user_id} (${sub.user_email})`);
    }

    await client.query('COMMIT');

    const totalProcessed = expiredResult.rows.length + gracePeriodEndedResult.rows.length;
    if (totalProcessed > 0) {
      console.log(`[Scheduler] Processed ${totalProcessed} subscription expirations`);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Scheduler] Error processing expired subscriptions:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Send expiration warning notifications to users whose subscriptions are about to expire
 */
export const sendExpirationWarnings = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    for (const days of EXPIRY_WARNING_DAYS) {
      // Find subscriptions expiring in exactly X days that haven't been notified yet
      const expiringResult = await client.query<ExpiringSubscription>(`
        SELECT
          s.subscription_id, s.user_id, s.end_date,
          u.name as user_name, u.email as user_email,
          sp.name as plan_name,
          EXTRACT(DAY FROM (s.end_date - NOW()))::int as days_until_expiry
        FROM subscriptions s
        JOIN users u ON s.user_id = u.user_id
        JOIN subscription_plans sp ON s.plan_id = sp.plan_id
        WHERE s.status = 'ACTIVE'
          AND s.end_date > NOW()
          AND DATE(s.end_date) = DATE(NOW() + INTERVAL '${days} days')
          AND NOT EXISTS (
            SELECT 1 FROM notifications n
            WHERE n.user_id = s.user_id
              AND n.type = 'SUBSCRIPTION_EXPIRING'
              AND (n.metadata->>'days_remaining')::int = $1
              AND n.created_at > NOW() - INTERVAL '1 day'
          )
      `, [days]);

      for (const sub of expiringResult.rows) {
        await client.query(`
          INSERT INTO notifications (user_id, type, title, message, metadata)
          VALUES ($1, 'SUBSCRIPTION_EXPIRING', $2, $3, $4)
        `, [
          sub.user_id,
          `Subscription Expiring in ${days} Day${days > 1 ? 's' : ''}`,
          `Your ${sub.plan_name} subscription will expire in ${days} day${days > 1 ? 's' : ''}. Renew now to avoid service interruption.`,
          JSON.stringify({
            subscription_id: sub.subscription_id,
            plan_name: sub.plan_name,
            days_remaining: days,
            end_date: sub.end_date
          })
        ]);

        console.log(`[Scheduler] Sent ${days}-day warning to user ${sub.user_id} (${sub.user_email})`);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Error sending expiration warnings:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Run all subscription scheduled tasks
 */
export const runSubscriptionTasks = async (): Promise<void> => {
  console.log(`[Scheduler] Running subscription tasks at ${new Date().toISOString()}`);

  try {
    await processExpiredSubscriptions();
    await sendExpirationWarnings();
    console.log('[Scheduler] Subscription tasks completed successfully');
  } catch (error) {
    console.error('[Scheduler] Subscription tasks failed:', error);
  }
};

/**
 * Start the subscription scheduler (runs every hour)
 */
export const startSubscriptionScheduler = (intervalMs: number = 60 * 60 * 1000): NodeJS.Timeout => {
  console.log('[Scheduler] Starting subscription scheduler...');

  // Run immediately on startup
  runSubscriptionTasks();

  // Then run on interval
  const interval = setInterval(runSubscriptionTasks, intervalMs);

  console.log(`[Scheduler] Scheduler running every ${intervalMs / 1000 / 60} minutes`);

  return interval;
};

export default {
  processExpiredSubscriptions,
  sendExpirationWarnings,
  runSubscriptionTasks,
  startSubscriptionScheduler
};
