import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { Kelviq, environmentFromEnv, validateEvent, WebhookVerificationError } from '@kelviq/node-sdk';
import type { ChargePeriod } from '@kelviq/node-sdk/dist/constants';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

// Initialize Kelviq Client
// Production environment is determined via KELVIQ_ENV="production"
const serverApiKey = process.env.KELVIQ_SERVER_API_KEY || '';
if (!serverApiKey) {
  console.warn('[Kelviq] WARNING: KELVIQ_SERVER_API_KEY is not set in environment.');
}

export const kelviq = new Kelviq({
  accessToken: serverApiKey,
  environment: environmentFromEnv(),
});

// Allowed plan identifier from published production catalog
export const ALLOWED_PLAN_IDENTIFIER = 'starter-plan';

// Allowed billing periods
export const ALLOWED_CHARGE_PERIODS: ChargePeriod[] = ['MONTHLY', 'YEARLY'];

// In-memory set to skip duplicate webhook event IDs
const processedWebhookEventIds = new Set<string>();

/**
 * Server-side helper to resolve or generate the signed-in user's customerId.
 * Never read from request body or query params.
 */
export function getOrCreateServerCustomerId(req: Request): { customerId: string; email: string; name: string } {
  const user = (req as any).supabaseUser as {
    id?: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  } | undefined;

  if (!user?.id || !user.email) {
    throw new Error('A verified Supabase user with an email address is required.');
  }

  // Stable provider-independent mapping: the same Supabase user always resolves
  // to the same Kelviq customer identifier. Never trust client-supplied IDs.
  const customerId = `glitch_${user.id}`;
  const metadataName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name;
  const name = typeof metadataName === 'string' && metadataName.trim()
    ? metadataName.trim().slice(0, 120)
    : user.email.split('@')[0];

  return { customerId, email: user.email, name };
}

/**
 * Helper to ensure the customer exists in Kelviq with an email address
 * before creating checkout or portal sessions.
 */
export async function ensureCustomerExists(customerId: string, email: string, name: string): Promise<void> {
  try {
    await kelviq.customers.create({
      customerId,
      email,
      name,
    });
    console.log(`[Kelviq] Created customer ${customerId} (${email})`);
  } catch (error: any) {
    // Customer may already exist (e.g. 409 or already registered)
    // Update customer email if needed
    try {
      await kelviq.customers.update({
        customerId,
        email,
        name,
      });
    } catch {
      // Ignore if update fails or already up to date
    }
  }
}

/**
 * Check if the signed-in user has access to a specific feature.
 * Fails closed (returns false) if an error occurs.
 */
export async function hasFeature(customerId: string, featureId: string): Promise<boolean> {
  try {
    const hasAccess = await kelviq.entitlements.hasAccess({
      customerId,
      featureId,
    });
    return Boolean(hasAccess);
  } catch (error: any) {
    console.error(`[Kelviq] Entitlement check failed for customer=${customerId}, feature=${featureId}:`, error?.message);
    // Fail closed
    return false;
  }
}

/**
 * POST /api/kelviq/checkout
 * Creates a checkout session for the signed-in user.
 */
export async function handleCheckout(req: Request, res: Response) {
  try {
    const { customerId, email, name } = getOrCreateServerCustomerId(req);
    const { chargePeriod = 'MONTHLY' } = req.body;

    // Validate charge period strictly
    if (!ALLOWED_CHARGE_PERIODS.includes(chargePeriod as ChargePeriod)) {
      return res.status(400).json({
        success: false,
        error: `Invalid chargePeriod. Allowed: ${ALLOWED_CHARGE_PERIODS.join(', ')}`,
      });
    }

    // Ensure customer exists with email in Kelviq
    await ensureCustomerExists(customerId, email, name);

    // Determine absolute successUrl
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const appUrl = process.env.APP_URL || `${protocol}://${host}`;
    const successUrl = `${appUrl}/?billing=success`;

    const session = await kelviq.checkout.createSession({
      planIdentifier: ALLOWED_PLAN_IDENTIFIER,
      chargePeriod: chargePeriod as ChargePeriod,
      customerId,
      successUrl,
    });

    console.log(`[Kelviq] Created checkout session for customer ${customerId}: ${session.checkoutUrl}`);

    res.json({
      success: true,
      checkoutUrl: session.checkoutUrl,
      checkoutSessionId: session.checkoutSessionId,
    });
  } catch (error: any) {
    console.error('[Kelviq] Error creating checkout session:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create checkout session' });
  }
}

/**
 * POST /api/kelviq/portal
 * Creates a Customer Portal session for managing subscriptions.
 */
export async function handlePortal(req: Request, res: Response) {
  try {
    const { customerId } = getOrCreateServerCustomerId(req, res);

    try {
      const portalSession = await kelviq.portal.createSession({
        customerId,
      });

      const portalUrl = `${portalSession.customerPortalUrl}?token=${portalSession.token}`;
      return res.json({
        success: true,
        portalUrl,
        email: portalSession.email,
      });
    } catch (portalError: any) {
      // Kelviq returns 400 until the customer exists in Kelviq with an email (unknown id, or record with no email)
      console.warn(`[Kelviq] Customer portal request failed for customerId ${customerId}:`, portalError?.message);
      return res.status(400).json({
        success: false,
        error: 'No active billing subscription or customer profile found. Please subscribe to a plan first.',
      });
    }
  } catch (error: any) {
    console.error('[Kelviq] Portal creation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to open customer portal' });
  }
}

/**
 * GET /api/kelviq/entitlements
 * Retrieves current user's entitlement state.
 */
export async function handleGetEntitlements(req: Request, res: Response) {
  try {
    const { customerId, email } = getOrCreateServerCustomerId(req, res);

    const [specialGrade, unlimitedStory] = await Promise.all([
      hasFeature(customerId, 'special-grade-access'),
      hasFeature(customerId, 'unlimited-story-campaign'),
    ]);

    const isPro = specialGrade && unlimitedStory;

    res.json({
      success: true,
      customerId,
      email,
      isPro,
      entitlements: {
        'special-grade-access': specialGrade,
        'unlimited-story-campaign': unlimitedStory,
        'ai-compute-credits': isPro ? 500 : 20,
      },
    });
  } catch (error: any) {
    console.error('[Kelviq] Error fetching entitlements:', error);
    res.json({
      success: true,
      customerId: 'guest',
      isPro: false,
      entitlements: {
        'special-grade-access': false,
        'unlimited-story-campaign': false,
        'ai-compute-credits': 20,
      },
    });
  }
}

/**
 * POST /api/kelviq/report-usage
 * Reports METER feature usage (e.g. AI compute credits).
 */
export async function handleReportUsage(req: Request, res: Response) {
  try {
    const { customerId } = getOrCreateServerCustomerId(req, res);
    const { credits = 1 } = req.body;

    await kelviq.reporting.reportUsage({
      customerId,
      featureId: 'ai-compute-credits',
      value: Number(credits) || 1,
      behaviour: 'DELTA',
    });

    res.json({ success: true, reported: credits, customerId });
  } catch (error: any) {
    console.error('[Kelviq] Error reporting usage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/kelviq/webhooks
 * Verifies webhook signature with raw payload and processes event lifecycle.
 */
export async function handleWebhook(req: Request, res: Response) {
  const secret = process.env.KELVIQ_WEBHOOK_SECRET || '';
  if (!secret) {
    console.error('[Kelviq Webhook] KELVIQ_WEBHOOK_SECRET is not configured.');
    return res.status(500).json({ error: 'Webhook secret not configured on server' });
  }

  // Raw body is required for signature verification
  const rawBody = (req as any).rawBody || req.body;

  let event: Record<string, any>;
  try {
    event = validateEvent(rawBody, req.headers as Record<string, string>, secret);
  } catch (err: any) {
    console.error('[Kelviq Webhook] Webhook validation failed:', err.message);
    return res.status(403).json({ error: 'Invalid webhook signature' });
  }

  const eventId = String(event.id || event.eventId || '');
  const eventType = String(event.type || event.eventType || '');

  // Skip duplicate events
  if (eventId && processedWebhookEventIds.has(eventId)) {
    console.log(`[Kelviq Webhook] Skipping duplicate event ${eventId}`);
    return res.json({ received: true, duplicate: true });
  }
  if (eventId) {
    processedWebhookEventIds.add(eventId);
    if (processedWebhookEventIds.size > 1000) {
      const first = processedWebhookEventIds.values().next().value;
      if (first) processedWebhookEventIds.delete(first);
    }
  }

  console.log(`[Kelviq Webhook] Received verified event: ${eventType} (${eventId})`);

  switch (eventType) {
    case 'checkout.completed':
      // TODO: Handle checkout.completed
      // Provision Pro access, record transaction details, send onboarding email to customer
      console.log('[Kelviq Webhook] TODO: checkout.completed', event.data);
      break;

    case 'invoice.payment_failed':
      // TODO: Handle invoice.payment_failed
      // Notify customer of failed renewal payment, trigger dunning flow or grace period
      console.log('[Kelviq Webhook] TODO: invoice.payment_failed', event.data);
      break;

    case 'subscription.created':
      // TODO: Handle subscription.created
      // Store subscription ID, mark user account as Pro in persistent database
      console.log('[Kelviq Webhook] TODO: subscription.created', event.data);
      break;

    case 'subscription.updated':
      // TODO: Handle subscription.updated
      // Refresh customer entitlements cache and synchronize billing period changes
      console.log('[Kelviq Webhook] TODO: subscription.updated', event.data);
      break;

    case 'subscription.plan_changed':
      // TODO: Handle subscription.plan_changed
      // Update plan tier and recalculate feature limits
      console.log('[Kelviq Webhook] TODO: subscription.plan_changed', event.data);
      break;

    case 'subscription.cancelled':
      // TODO: Handle subscription.cancelled
      // Fires when the subscription actually ends (not when cancellation is scheduled).
      // Revoke Pro features and downgrade customer to Free tier
      console.log('[Kelviq Webhook] TODO: subscription.cancelled', event.data);
      break;

    default:
      console.log(`[Kelviq Webhook] Unhandled event type: ${eventType}`);
  }

  res.json({ received: true });
}
