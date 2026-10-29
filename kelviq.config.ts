// kelviq.config.ts — pricing-as-code for Kelviq.
import { product, feature, plan } from '@kelviq/cli/config';

export const monthlySubscription = product({
  identifier: 'monthly-subscription',
  name: 'Pro Subscription',
  taxCode: 'saas',
});

export const specialGradeAccess = feature({
  identifier: 'special-grade-access',
  name: 'Special Grade Combat & Domain Expansion',
  type: 'BOOLEAN',
});

export const unlimitedStoryCampaign = feature({
  identifier: 'unlimited-story-campaign',
  name: 'Unlimited Story Campaign & Dojo Training',
  type: 'BOOLEAN',
});

export const aiComputeCredits = feature({
  identifier: 'ai-compute-credits',
  name: 'AI Compute Credits',
  type: 'METER',
  featureDetails: {
    featureSubType: 'PRE_AGGREGATED_USAGE',
    units: { singular: 'credit', plural: 'credits' },
  },
});

export const starterPlan = plan({
  identifier: 'starter-plan',
  name: 'Pro Pass',
  product: 'monthly-subscription',
  entitlements: [
    { feature: 'special-grade-access', value: true },
    { feature: 'unlimited-story-campaign', value: true },
    { feature: 'ai-compute-credits', value: 500 },
  ],
  prices: [
    {
      priceType: 'PAID',
      currency: 'USD',
      freeTrial: false,
      trialPeriod: 0,
      taxBehavior: 'EXCLUSIVE',
      enabled: true,
      chargeCatalogPrice: [
        {
          feature: null,
          priceModel: 'FLAT',
          paymentType: 'ADVANCE_COMMITMENT',
          reset: 'NEVER',
          charges: [
            { chargePeriod: 'MONTHLY', priceData: { amount: 9 } },
            { chargePeriod: 'YEARLY', priceData: { amount: 90 } },
          ],
        },
      ],
    },
  ],
});
