/**
 * Campaign tracking utilities.
 * Captures campaign parameter from URL and stores in cookie.
 */

const CAMPAIGN_COOKIE_NAME = 'campaign';
const COOKIE_MAX_AGE_DAYS = 30;

/**
 * Get the campaign value from cookie.
 */
export function getCampaign(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CAMPAIGN_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Set the campaign value in cookie.
 */
export function setCampaign(campaign: string): void {
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60; // Convert days to seconds
  document.cookie = `${CAMPAIGN_COOKIE_NAME}=${encodeURIComponent(campaign)};path=/;max-age=${maxAge};SameSite=Lax`;
}

/**
 * Capture campaign from URL path and store in cookie.
 * Call this on app load to capture campaign from routes like /cards/{campaign}
 */
export function captureCampaignFromPath(campaignParam: string | undefined): void {
  if (campaignParam) {
    setCampaign(campaignParam);
  }
}
