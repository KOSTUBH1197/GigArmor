from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score
import os
import random
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gigarmor-ai")

app = FastAPI(title="GigArmor AI Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# RISK ASSESSMENT MODEL
# ─────────────────────────────────────────────
class RiskAssessmentModel:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.train_model()

    def generate_training_data(self, n_samples=2000):
        np.random.seed(42)
        data = []
        for _ in range(n_samples):
            lat = 12.9 + np.random.random() * 9.2
            lon = 68.1 + np.random.random() * 29.4
            rainfall = np.random.exponential(20)
            temperature = 15 + np.random.random() * 25
            humidity = 20 + np.random.random() * 60
            aqi = np.random.exponential(100)
            flood_risk = np.random.random()
            income = 500 + np.random.random() * 2000
            platform_factor = np.random.choice([0.8, 1.0, 1.2, 0.9])
            experience_years = np.random.uniform(0.5, 8)

            weather_risk = min(30, (rainfall > 50) * 20 + (temperature > 35) * 15 + (humidity > 70) * 10)
            pollution_risk = min(20, aqi / 10)
            location_risk = min(30, flood_risk * 25 + (lat < 22) * 5)
            behavior_risk = min(20, max(0, (2000 - income) / 100) + max(0, (3 - experience_years) * 2))

            total = weather_risk * 0.3 + pollution_risk * 0.2 + location_risk * 0.3 + behavior_risk * 0.2
            risk_score = min(100, total * platform_factor)

            data.append({
                'latitude': lat, 'longitude': lon,
                'rainfall': rainfall, 'temperature': temperature,
                'humidity': humidity, 'aqi': aqi,
                'flood_risk': flood_risk, 'income': income,
                'platform_factor': platform_factor,
                'experience_years': experience_years,
                'risk_score': risk_score,
            })
        return pd.DataFrame(data)

    def train_model(self):
        df = self.generate_training_data()
        feature_cols = ['latitude', 'longitude', 'rainfall', 'temperature',
                        'humidity', 'aqi', 'flood_risk', 'income',
                        'platform_factor', 'experience_years']
        X, y = df[feature_cols], df['risk_score']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.scaler.fit(X_train)
        self.model.fit(self.scaler.transform(X_train), y_train)
        mse = mean_squared_error(y_test, self.model.predict(self.scaler.transform(X_test)))
        logger.info(f"Risk Model trained — MSE: {mse:.2f}")
        self.is_trained = True

    def predict_risk(self, features: dict) -> float:
        df = pd.DataFrame([features])
        risk = self.model.predict(self.scaler.transform(df))[0]
        return float(max(0, min(100, risk)))


# ─────────────────────────────────────────────
# FRAUD DETECTION MODEL
# ─────────────────────────────────────────────
class FraudDetectionModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.train_model()

    def generate_training_data(self, n_samples=2000):
        np.random.seed(123)
        data = []
        for _ in range(n_samples):
            claim_frequency = np.random.poisson(0.5)
            location_consistency = np.random.beta(2, 1)
            time_pattern = np.random.beta(2, 1)
            amount_consistency = np.random.beta(2, 1)
            gps_spoof = float(np.random.random() < 0.05)
            duplicate_claim = float(np.random.random() < 0.03)
            unusual_timing = float(np.random.random() < 0.10)
            location_anomaly = float(np.random.random() < 0.08)
            rapid_claims = float(np.random.random() < 0.04)   # NEW: multiple claims in short window

            fraud_score = (gps_spoof * 0.35 + duplicate_claim * 0.30 +
                           unusual_timing * 0.15 + location_anomaly * 0.10 +
                           rapid_claims * 0.10 + np.random.normal(0, 0.08))
            is_fraud = int(fraud_score > 0.28)

            data.append({
                'claim_frequency': claim_frequency,
                'location_consistency': location_consistency,
                'time_pattern': time_pattern,
                'amount_consistency': amount_consistency,
                'gps_spoof': gps_spoof,
                'duplicate_claim': duplicate_claim,
                'unusual_timing': unusual_timing,
                'location_anomaly': location_anomaly,
                'rapid_claims': rapid_claims,
                'is_fraud': is_fraud,
            })
        return pd.DataFrame(data)

    def train_model(self):
        df = self.generate_training_data()
        feature_cols = ['claim_frequency', 'location_consistency', 'time_pattern',
                        'amount_consistency', 'gps_spoof', 'duplicate_claim',
                        'unusual_timing', 'location_anomaly', 'rapid_claims']
        X, y = df[feature_cols], df['is_fraud']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.scaler.fit(X_train)
        self.model.fit(self.scaler.transform(X_train), y_train)
        acc = accuracy_score(y_test, self.model.predict(self.scaler.transform(X_test)))
        logger.info(f"Fraud Model trained — Accuracy: {acc:.2f}")
        self.is_trained = True

    def predict_fraud(self, features: dict) -> float:
        df = pd.DataFrame([features])
        return float(self.model.predict_proba(self.scaler.transform(df))[0][1])


# Initialize at startup
risk_model = RiskAssessmentModel()
fraud_model = FraudDetectionModel()

PLATFORM_FACTORS = {
    'swiggy': 1.0, 'zomato': 1.1,
    'zepto': 0.9,  'amazon': 1.2, 'other': 1.0,
}


# ─────────────────────────────────────────────
# PYDANTIC SCHEMAS
# ─────────────────────────────────────────────
class RiskRequest(BaseModel):
    location: dict
    deliveryPlatform: str
    averageWeeklyIncome: float
    experienceYears: float = 2.0   # optional — defaults to 2 years

class FraudRequest(BaseModel):
    workerId: str
    triggerEvent: dict
    location: dict
    claimHistory: dict = {}        # optional metadata


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def get_location_seed(lat: float, lon: float) -> int:
    """Deterministic seed from location so risk is consistent for same area."""
    return int(abs(lat * 1000) + abs(lon * 1000)) % (2**31)

CITY_ZONES = [
    {"name": "Mumbai", "latMin": 18.8, "latMax": 19.3, "lonMin": 72.7, "lonMax": 73.1, "aqi_base": 120, "rain_base": 60},
    {"name": "Delhi",  "latMin": 28.4, "latMax": 28.9, "lonMin": 76.8, "lonMax": 77.5, "aqi_base": 280, "rain_base": 25},
    {"name": "Bangalore", "latMin": 12.8, "latMax": 13.2, "lonMin": 77.4, "lonMax": 77.8, "aqi_base": 95,  "rain_base": 35},
    {"name": "Chennai", "latMin": 12.9, "latMax": 13.2, "lonMin": 80.1, "lonMax": 80.4, "aqi_base": 110, "rain_base": 50},
    {"name": "Kolkata", "latMin": 22.4, "latMax": 22.7, "lonMin": 88.2, "lonMax": 88.6, "aqi_base": 200, "rain_base": 45},
    {"name": "Hyderabad", "latMin": 17.2, "latMax": 17.6, "lonMin": 78.3, "lonMax": 78.7, "aqi_base": 130, "rain_base": 30},
]

def get_city_env(lat: float, lon: float):
    for zone in CITY_ZONES:
        if zone["latMin"] <= lat <= zone["latMax"] and zone["lonMin"] <= lon <= zone["lonMax"]:
            return zone
    return None

def simulate_env_data(lat: float, lon: float):
    """Generate deterministic-ish environmental data anchored to city zone."""
    seed = get_location_seed(lat, lon)
    rng = np.random.RandomState(seed % 1000 + (datetime.now().hour * 17))  # varies by hour

    city = get_city_env(lat, lon)
    if city:
        rainfall = rng.exponential(city["rain_base"])
        aqi = city["aqi_base"] + rng.normal(0, 30)
    else:
        rainfall = rng.exponential(20)
        aqi = rng.exponential(100)

    return {
        "rainfall": max(0, rainfall),
        "temperature": 15 + rng.random() * 25,
        "humidity": 20 + rng.random() * 60,
        "aqi": max(10, aqi),
        "flood_risk": rng.random(),
    }

def build_explainability(weather_risk, pollution_risk, location_risk, behavior_risk, city_name, platform):
    reasons = []
    if weather_risk > 18:
        reasons.append(f"{'High monsoon rainfall' if weather_risk > 22 else 'Above-average rainfall'} in your zone")
    if pollution_risk > 14:
        reasons.append(f"{'Hazardous' if pollution_risk > 18 else 'Poor'} AQI levels detected{'in ' + city_name if city_name else ''}")
    if location_risk > 15:
        reasons.append("Flood-prone delivery corridors in your area")
    if behavior_risk > 14:
        reasons.append("Lower income bracket increases financial exposure")
    if platform in ['amazon', 'zomato']:
        reasons.append(f"{platform.title()} routes carry higher traffic-related risk")
    if not reasons:
        reasons.append("Standard risk profile — no major hazards detected")
    return reasons


# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────
@app.post("/calculate-risk")
async def calculate_risk(request: RiskRequest):
    try:
        lat = float(request.location.get('latitude', 19.076))
        lon = float(request.location.get('longitude', 72.877))
        platform = request.deliveryPlatform.lower()
        income = float(request.averageWeeklyIncome)
        exp_years = float(request.experienceYears)

        platform_factor = PLATFORM_FACTORS.get(platform, 1.0)
        city = get_city_env(lat, lon)
        city_name = city["name"] if city else ""

        env = simulate_env_data(lat, lon)
        rainfall    = env["rainfall"]
        temperature = env["temperature"]
        humidity    = env["humidity"]
        aqi         = env["aqi"]
        flood_risk  = env["flood_risk"]

        # Weighted risk components (each 0-30 range)
        weather_risk  = min(30, (rainfall > 50) * 20 + (temperature > 35) * 15 + (humidity > 70) * 10)
        pollution_risk = min(20, aqi / 10)
        location_risk  = min(30, flood_risk * 25 + (lat < 22 and rainfall > 40) * 5)
        behavior_risk  = min(20, max(0, (2000 - income) / 100) + max(0, (3 - exp_years) * 2))

        # ML model prediction
        features = {
            'latitude': lat, 'longitude': lon,
            'rainfall': rainfall, 'temperature': temperature,
            'humidity': humidity, 'aqi': aqi,
            'flood_risk': flood_risk, 'income': income,
            'platform_factor': platform_factor,
            'experience_years': exp_years,
        }
        ml_score = risk_model.predict_risk(features)

        # Hybrid: 60% ML + 40% rule-based for interpretability
        rule_score = (weather_risk * 0.3 + pollution_risk * 0.2 +
                      location_risk * 0.3 + behavior_risk * 0.2) * platform_factor
        risk_score = round(0.6 * ml_score + 0.4 * rule_score, 2)

        # Pricing
        weekly_premium = round(min(120, max(30, 40 + (risk_score / 100) * 80)), 2)
        coverage_amount = round(max(1000, income * 0.7), 2)

        return {
            "riskScore": risk_score,
            "weeklyPremium": weekly_premium,
            "coverageAmount": coverage_amount,
            "riskFactors": {
                "weatherRisk": round(weather_risk, 2),
                "pollutionRisk": round(pollution_risk, 2),
                "floodRisk": round(location_risk, 2),
                "locationRisk": round(location_risk, 2),
                "behaviorRisk": round(behavior_risk, 2),
            },
            "riskBreakdown": {
                "weather":   {"score": round(weather_risk, 1),   "weight": 0.30, "label": "Weather / Rainfall"},
                "pollution": {"score": round(pollution_risk, 1), "weight": 0.20, "label": "Pollution (AQI)"},
                "location":  {"score": round(location_risk, 1),  "weight": 0.30, "label": "Location / Flood"},
                "behavior":  {"score": round(behavior_risk, 1),  "weight": 0.20, "label": "Income Stability"},
            },
            "explainability": build_explainability(
                weather_risk, pollution_risk, location_risk, behavior_risk,
                city_name, platform
            ),
            "cityZone": city_name or "Unknown Zone",
            "environmentalSnapshot": {
                "rainfall_mm": round(rainfall, 1),
                "aqi": round(aqi, 0),
                "temperature_c": round(temperature, 1),
                "flood_risk_pct": round(flood_risk * 100, 1),
            },
            "source": "ai",
        }
    except Exception as e:
        logger.error(f"Risk calculation error: {e}")
        raise HTTPException(status_code=500, detail=f"Risk calculation error: {str(e)}")


@app.post("/check-fraud")
async def check_fraud(request: FraudRequest):
    try:
        trigger_type = request.triggerEvent.get('type', 'unknown')
        history = request.claimHistory

        # Rule-based signals
        claim_count_24h = int(history.get('claims_24h', 0))
        gps_spoof       = float(claim_count_24h > 3 or random.random() < 0.04)
        duplicate_claim = float(claim_count_24h > 1)
        unusual_timing  = float(trigger_type == 'curfew' and random.random() < 0.75)
        location_anomaly = float(random.random() < 0.06)
        rapid_claims    = float(claim_count_24h >= 2)

        features = {
            'claim_frequency':     min(claim_count_24h, 5),
            'location_consistency': random.betavariate(2, 1),
            'time_pattern':         random.betavariate(2, 1),
            'amount_consistency':   random.betavariate(2, 1),
            'gps_spoof':           gps_spoof,
            'duplicate_claim':     duplicate_claim,
            'unusual_timing':      unusual_timing,
            'location_anomaly':    location_anomaly,
            'rapid_claims':        rapid_claims,
        }

        fraud_probability = fraud_model.predict_fraud(features)
        is_fraud = fraud_probability > 0.40

        reasons = []
        if gps_spoof > 0.5:   reasons.append("GPS location spoofing detected")
        if duplicate_claim:    reasons.append("Duplicate claim pattern within 24h")
        if unusual_timing:     reasons.append("Unusual timing — high suspicion for this trigger type")
        if location_anomaly:   reasons.append("Location inconsistency with registered zone")
        if rapid_claims:       reasons.append("Multiple rapid claims detected")
        if fraud_probability > 0.70: reasons.append("High overall fraud probability score")

        return {
            "passed": not is_fraud,
            "probability": round(fraud_probability, 3),
            "reasons": reasons,
            "riskLevel": "high" if fraud_probability > 0.6 else "medium" if fraud_probability > 0.35 else "low",
        }
    except Exception as e:
        logger.error(f"Fraud check error: {e}")
        raise HTTPException(status_code=500, detail=f"Fraud check error: {str(e)}")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "models": {
            "risk_assessment": risk_model.is_trained,
            "fraud_detection": fraud_model.is_trained,
        }
    }


@app.get("/model-info")
async def model_info():
    return {
        "risk_model": {
            "type": "Hybrid (RandomForest 60% + Rule-based 40%)",
            "features": ["latitude", "longitude", "rainfall", "temperature", "humidity",
                         "aqi", "flood_risk", "income", "platform_factor", "experience_years"],
            "weights": {"weather": 0.30, "pollution": 0.20, "location": 0.30, "behavior": 0.20},
            "trained": risk_model.is_trained,
        },
        "fraud_model": {
            "type": "RandomForestClassifier",
            "features": ["claim_frequency", "location_consistency", "time_pattern",
                         "amount_consistency", "gps_spoof", "duplicate_claim",
                         "unusual_timing", "location_anomaly", "rapid_claims"],
            "trained": fraud_model.is_trained,
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)