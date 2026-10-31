import posthog from "posthog-js";

let initialized = false;

export function initializeAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  const host = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

  if (initialized || !key || typeof window === "undefined") return;

  posthog.init(key, {
    api_host: host || "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
    person_profiles: "identified_only",
    persistence: "localStorage+cookie",
  });

  initialized = true;
}

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  if (initialized) posthog.capture(event, properties);
}

export function identifyAnalyticsUser(userId: string) {
  if (initialized) posthog.identify(userId);
}

export function resetAnalyticsUser() {
  if (initialized) posthog.reset();
}
