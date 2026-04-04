/**
 * Rule-based fallback risk model.
 * Used when the AI microservice is unavailable.
 * Returns the same shape as the AI /calculate-risk response.
 */

const PLATFORM_RISK = {
  swiggy: 1.0,
  zomato: 1.1,
  zepto: 0.9,
  amazon: 1.2,
  other: 1.0,
};

// High-risk city zones by rough lat/lon bounding boxes (India)
const HIGH_RISK_ZONES = [
  { name: 'Mumbai Coastal', latMin: 18.8, latMax: 19.3, lonMin: 72.7, lonMax: 73.0, riskAdd: 15 },
  { name: 'Delhi NCR', latMin: 28.4, latMax: 28.9, lonMin: 76.8, lonMax: 77.5, riskAdd: 20 },
  { name: 'Chennai Coast', latMin: 12.9, latMax: 13.2, lonMin: 80.1, lonMax: 80.4, riskAdd: 12 },
  { name: 'Kolkata', latMin: 22.4, latMax: 22.7, lonMin: 88.2, lonMax: 88.6, riskAdd: 18 },
];

/**
 * @param {object} params
 * @param {object} params.location - { latitude, longitude }
 * @param {string} params.deliveryPlatform
 * @param {number} params.averageWeeklyIncome
 */
function calculateFallbackRisk({ location, deliveryPlatform, averageWeeklyIncome }) {
  const lat = Number(location?.latitude) || 19.076;
  const lon = Number(location?.longitude) || 72.877;
  const income = Number(averageWeeklyIncome) || 1500;
  const platform = (deliveryPlatform || 'other').toLowerCase();

  // --- Individual Risk Components (0-25 each, total max 100) ---

  // 1. Weather risk — estimate from lat (tropical = higher)
  const tropicalFactor = lat < 20 ? 1.3 : lat < 25 ? 1.1 : 0.9;
  const weatherRisk = Math.min(25, Math.round(10 * tropicalFactor));

  // 2. Pollution risk — Delhi-heavy heuristic
  const isDelhiRegion = lat > 28 && lat < 29 && lon > 76.8 && lon < 77.5;
  const pollutionRisk = isDelhiRegion ? 22 : Math.min(20, Math.round(8 + (lat > 25 ? 4 : 0)));

  // 3. Location / flood risk — zone-based
  let locationRisk = 8; // baseline
  for (const zone of HIGH_RISK_ZONES) {
    if (lat >= zone.latMin && lat <= zone.latMax && lon >= zone.lonMin && lon <= zone.lonMax) {
      locationRisk = Math.min(25, zone.riskAdd);
      break;
    }
  }

  // 4. Behavioral / income risk
  const incomeRisk = Math.min(25, Math.max(5, Math.round((2500 - income) / 100)));

  // Platform multiplier on total
  const platformMultiplier = PLATFORM_RISK[platform] || 1.0;

  const rawScore = (weatherRisk + pollutionRisk + locationRisk + incomeRisk) * platformMultiplier;
  const riskScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Weekly premium: base ₹40 + risk uplift up to ₹80
  const weeklyPremium = Math.round(Math.min(120, Math.max(30, 40 + (riskScore / 100) * 80)));

  // Coverage = 70% of weekly income, min ₹1000
  const coverageAmount = Math.max(1000, Math.round(income * 0.7));

  // Explainability
  const explainability = [];
  if (weatherRisk > 15) explainability.push('Located in a high-rainfall tropical zone');
  if (pollutionRisk > 18) explainability.push('High AQI levels detected in your city');
  if (locationRisk > 15) explainability.push('Flood-prone delivery area identified');
  if (incomeRisk > 18) explainability.push('Lower income increases financial vulnerability');
  if (platformMultiplier > 1.05) explainability.push(`${platform} routes carry above-average risk`);
  if (explainability.length === 0) explainability.push('Standard risk profile for your region');

  return {
    riskScore,
    weeklyPremium,
    coverageAmount,
    riskFactors: {
      weatherRisk,
      pollutionRisk,
      floodRisk: locationRisk,      // alias for frontend compat
      locationRisk,
      behaviorRisk: incomeRisk,
    },
    riskBreakdown: {
      weather: { score: weatherRisk, weight: 0.3, label: 'Weather Risk' },
      pollution: { score: pollutionRisk, weight: 0.2, label: 'Pollution (AQI)' },
      location: { score: locationRisk, weight: 0.3, label: 'Location / Flood' },
      behavior: { score: incomeRisk, weight: 0.2, label: 'Income Stability' },
    },
    explainability,
    source: 'fallback', // lets frontend show "AI unavailable" badge
  };
}

module.exports = { calculateFallbackRisk };
