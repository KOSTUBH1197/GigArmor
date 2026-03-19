const axios = require('axios');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const User = require('../models/User');

// Mock external API functions - replace with real APIs in production
const getWeatherData = async (lat, lon) => {
  try {
    // In production, use OpenWeather API
    // const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`);

    // Mock data for demo
    const mockWeather = {
      rainfall: Math.random() * 100, // mm in last 24 hours
      temperature: 20 + Math.random() * 25, // °C
      humidity: 30 + Math.random() * 50, // %
    };

    return mockWeather;
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
};

const getAQIData = async (lat, lon) => {
  try {
    // In production, use AQI API
    // const response = await axios.get(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${process.env.AQI_API_KEY}`);

    // Mock data for demo
    const mockAQI = {
      aqi: 20 + Math.random() * 400, // AQI value
      pm25: Math.random() * 100,
      pm10: Math.random() * 150,
    };

    return mockAQI;
  } catch (error) {
    console.error('AQI API error:', error);
    return null;
  }
};

const getFloodData = async (lat, lon) => {
  try {
    // In production, use flood monitoring APIs
    // Mock data for demo
    const mockFlood = {
      floodAlert: Math.random() > 0.98, // 2% chance of flood alert
      floodLevel: Math.random() * 10, // meters
      riskLevel: Math.random() > 0.95 ? 'high' : Math.random() > 0.85 ? 'medium' : 'low',
    };

    return mockFlood;
  } catch (error) {
    console.error('Flood API error:', error);
    return null;
  }
};

const checkCurfewData = async (lat, lon) => {
  try {
    // In production, integrate with government APIs or traffic data
    // Mock data for demo - simulate curfew in certain areas
    const mockCurfew = {
      curfewActive: Math.random() > 0.99, // 1% chance of curfew
      curfewHours: '22:00-06:00',
      reason: 'Local restrictions',
    };

    return mockCurfew;
  } catch (error) {
    console.error('Curfew API error:', error);
    return null;
  }
};

// Check if location is within affected area (simplified distance check)
const isLocationAffected = (workerLat, workerLon, eventLat, eventLon, radiusKm = 10) => {
  const R = 6371; // Earth's radius in km
  const dLat = (eventLat - workerLat) * Math.PI / 180;
  const dLon = (eventLon - workerLon) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(workerLat * Math.PI / 180) * Math.cos(eventLat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance <= radiusKm;
};

const checkTriggers = async () => {
  try {
    console.log('🔍 Checking parametric triggers...');

    const activePolicies = await Policy.find({ status: 'active' }).populate('workerId');

    for (const policy of activePolicies) {
      const worker = policy.workerId;
      if (!worker || !worker.location) continue;

      const { latitude: workerLat, longitude: workerLon } = worker.location;

      // Fetch environmental data
      const [weather, aqi, flood, curfew] = await Promise.all([
        getWeatherData(workerLat, workerLon),
        getAQIData(workerLat, workerLon),
        getFloodData(workerLat, workerLon),
        checkCurfewData(workerLat, workerLon),
      ]);

      if (!weather || !aqi || !flood || !curfew) {
        console.warn(`Failed to fetch data for worker ${worker._id}`);
        continue;
      }

      let triggerType = null;
      let triggerValue = null;
      let triggerLocation = { latitude: workerLat, longitude: workerLon };

      // Check trigger conditions
      if (weather.rainfall > 50) {
        triggerType = 'rainfall';
        triggerValue = weather.rainfall;
      } else if (weather.temperature > 45) {
        triggerType = 'temperature';
        triggerValue = weather.temperature;
      } else if (aqi.aqi > 350) {
        triggerType = 'aqi';
        triggerValue = aqi.aqi;
      } else if (flood.floodAlert) {
        triggerType = 'flood';
        triggerValue = 1;
      } else if (curfew.curfewActive) {
        triggerType = 'curfew';
        triggerValue = 1;
      }

      if (triggerType) {
        // Check if claim already exists for this trigger in last 24 hours
        const existingClaim = await Claim.findOne({
          policyId: policy._id,
          'triggerEvent.type': triggerType,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        if (!existingClaim) {
          // Calculate payout (70% of coverage amount)
          const payoutAmount = Math.round(policy.coverageAmount * 0.7);

          // Create claim automatically
          const claim = new Claim({
            policyId: policy._id,
            workerId: worker._id,
            triggerEvent: {
              type: triggerType,
              value: triggerValue,
              location: triggerLocation,
              timestamp: new Date(),
            },
            payoutAmount,
            status: 'pending', // Will be processed by fraud check
          });

          await claim.save();

          console.log(`✅ Claim created for worker ${worker.name}: ${triggerType} (${triggerValue}) - ₹${payoutAmount}`);

          // Trigger fraud check and auto-processing
          try {
            const fraudResponse = await axios.post(`${process.env.AI_SERVICE_URL}/check-fraud`, {
              workerId: worker._id.toString(),
              triggerEvent: claim.triggerEvent,
              location: triggerLocation,
            }, { timeout: 5000 });

            const fraudCheck = fraudResponse.data;
            claim.fraudCheck = fraudCheck;

            if (fraudCheck.passed) {
              claim.status = 'paid';
              claim.paymentId = 'auto_payment_' + Date.now();
            } else {
              claim.status = 'pending'; // Requires manual review
            }

            await claim.save();
          } catch (error) {
            console.warn('Fraud check failed, claim requires manual review');
          }
        }
      }
    }

    console.log('✅ Parametric trigger check completed');
  } catch (error) {
    console.error('❌ Error in trigger check:', error);
  }
};

// Run trigger check every hour
setInterval(checkTriggers, 60 * 60 * 1000);

// Initial check
checkTriggers();

module.exports = { checkTriggers };