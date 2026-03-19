from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score
import pickle
import os
import random
from datetime import datetime, timedelta
import json

app = FastAPI(title="GigArmor AI Service", version="1.0.0")

# ML Models
class RiskAssessmentModel:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.train_model()

    def generate_training_data(self, n_samples=1000):
        """Generate synthetic training data for risk assessment"""
        np.random.seed(42)

        data = []
        for _ in range(n_samples):
            # Location factors (Mumbai, Delhi, Bangalore, etc.)
            lat = 12.9 + np.random.random() * 9.2  # India latitude range
            lon = 68.1 + np.random.random() * 29.4  # India longitude range

            # Environmental factors
            rainfall = np.random.exponential(20)  # Average 20mm/day
            temperature = 15 + np.random.random() * 25  # 15-40°C
            humidity = 20 + np.random.random() * 60  # 20-80%
            aqi = np.random.exponential(100)  # Average AQI 100
            flood_risk = np.random.random()  # 0-1

            # Worker factors
            income = 500 + np.random.random() * 2000  # ₹500-2500/week
            platform_factor = np.random.choice([0.8, 1.0, 1.2, 0.9])  # Platform risk multiplier

            # Calculate risk score based on factors
            weather_risk = (rainfall > 50) * 20 + (temperature > 35) * 15 + (humidity > 70) * 10
            pollution_risk = min(aqi / 10, 30)  # Max 30 points
            location_risk = flood_risk * 25  # Max 25 points
            income_risk = max(0, (2000 - income) / 100)  # Higher risk for lower income

            total_risk = weather_risk + pollution_risk + location_risk + income_risk
            risk_score = min(total_risk, 100)  # Cap at 100

            data.append({
                'latitude': lat,
                'longitude': lon,
                'rainfall': rainfall,
                'temperature': temperature,
                'humidity': humidity,
                'aqi': aqi,
                'flood_risk': flood_risk,
                'income': income,
                'platform_factor': platform_factor,
                'risk_score': risk_score
            })

        return pd.DataFrame(data)

    def train_model(self):
        """Train the risk assessment model"""
        df = self.generate_training_data(2000)

        # Features for training
        feature_cols = ['latitude', 'longitude', 'rainfall', 'temperature',
                       'humidity', 'aqi', 'flood_risk', 'income', 'platform_factor']

        X = df[feature_cols]
        y = df['risk_score']

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scale features
        self.scaler.fit(X_train)
        X_train_scaled = self.scaler.transform(X_train)

        # Train model
        self.model.fit(X_train_scaled, y_train)

        # Evaluate
        X_test_scaled = self.scaler.transform(X_test)
        y_pred = self.model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        print(f"Risk Model MSE: {mse:.2f}")

        self.is_trained = True

    def predict_risk(self, features):
        """Predict risk score for new data"""
        if not self.is_trained:
            raise HTTPException(status_code=500, detail="Model not trained")

        # Convert to DataFrame
        df = pd.DataFrame([features])

        # Scale features
        scaled_features = self.scaler.transform(df)

        # Predict
        risk_score = self.model.predict(scaled_features)[0]

        return max(0, min(100, risk_score))  # Clamp to 0-100

class FraudDetectionModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.train_model()

    def generate_training_data(self, n_samples=1000):
        """Generate synthetic training data for fraud detection"""
        np.random.seed(123)

        data = []
        for _ in range(n_samples):
            # Normal behavior patterns
            claim_frequency = np.random.poisson(0.5)  # Average 0.5 claims per week
            location_consistency = np.random.beta(2, 1)  # Usually consistent
            time_pattern = np.random.beta(2, 1)  # Usually normal hours
            amount_consistency = np.random.beta(2, 1)  # Usually consistent amounts

            # Fraud indicators
            gps_spoof = np.random.random() < 0.05  # 5% chance of GPS spoofing
            duplicate_claim = np.random.random() < 0.03  # 3% chance of duplicates
            unusual_timing = np.random.random() < 0.1  # 10% unusual timing
            location_anomaly = np.random.random() < 0.08  # 8% location anomalies

            # Determine if fraudulent
            fraud_score = (gps_spoof * 0.4 + duplicate_claim * 0.3 +
                          unusual_timing * 0.2 + location_anomaly * 0.1)

            # Add noise
            fraud_score += np.random.normal(0, 0.1)
            is_fraud = fraud_score > 0.3  # Threshold for fraud

            data.append({
                'claim_frequency': claim_frequency,
                'location_consistency': location_consistency,
                'time_pattern': time_pattern,
                'amount_consistency': amount_consistency,
                'gps_spoof': float(gps_spoof),
                'duplicate_claim': float(duplicate_claim),
                'unusual_timing': float(unusual_timing),
                'location_anomaly': float(location_anomaly),
                'is_fraud': int(is_fraud)
            })

        return pd.DataFrame(data)

    def train_model(self):
        """Train the fraud detection model"""
        df = self.generate_training_data(2000)

        # Features for training
        feature_cols = ['claim_frequency', 'location_consistency', 'time_pattern',
                       'amount_consistency', 'gps_spoof', 'duplicate_claim',
                       'unusual_timing', 'location_anomaly']

        X = df[feature_cols]
        y = df['is_fraud']

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scale features
        self.scaler.fit(X_train)
        X_train_scaled = self.scaler.transform(X_train)

        # Train model
        self.model.fit(X_train_scaled, y_train)

        # Evaluate
        X_test_scaled = self.scaler.transform(X_test)
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Fraud Model Accuracy: {accuracy:.2f}")

        self.is_trained = True

    def predict_fraud(self, features):
        """Predict fraud probability for new data"""
        if not self.is_trained:
            raise HTTPException(status_code=500, detail="Model not trained")

        # Convert to DataFrame
        df = pd.DataFrame([features])

        # Scale features
        scaled_features = self.scaler.transform(df)

        # Predict probability
        fraud_prob = self.model.predict_proba(scaled_features)[0][1]

        return fraud_prob

# Initialize models
risk_model = RiskAssessmentModel()
fraud_model = FraudDetectionModel()

# Pydantic models for API
class RiskRequest(BaseModel):
    location: dict
    deliveryPlatform: str
    averageWeeklyIncome: float

class FraudRequest(BaseModel):
    workerId: str
    triggerEvent: dict
    location: dict

@app.post("/calculate-risk")
async def calculate_risk(request: RiskRequest):
    try:
        # Extract features
        lat = request.location.get('latitude', 19.0760)  # Default to Mumbai
        lon = request.location.get('longitude', 72.8777)

        # Platform risk factor
        platform_factors = {
            'swiggy': 1.0,
            'zomato': 1.1,
            'zepto': 0.9,
            'amazon': 1.2,
            'other': 1.0
        }
        platform_factor = platform_factors.get(request.deliveryPlatform.lower(), 1.0)

        # Generate environmental features (in production, fetch from APIs)
        rainfall = np.random.exponential(20)
        temperature = 15 + np.random.random() * 25
        humidity = 20 + np.random.random() * 60
        aqi = np.random.exponential(100)
        flood_risk = np.random.random()

        features = {
            'latitude': lat,
            'longitude': lon,
            'rainfall': rainfall,
            'temperature': temperature,
            'humidity': humidity,
            'aqi': aqi,
            'flood_risk': flood_risk,
            'income': request.averageWeeklyIncome,
            'platform_factor': platform_factor
        }

        risk_score = risk_model.predict_risk(features)

        # Base weekly premium
        base_premium = 40

        # Scale premium based on risk
        risk_multiplier = risk_score / 100

        weekly_premium = base_premium + (risk_multiplier * 60)

        # Prevent extreme pricing
        weekly_premium = min(max(weekly_premium, 30), 120)

        # Coverage: 70% of weekly income
        coverage_amount = max(request.averageWeeklyIncome * 0.7, 1000)


        return {
            "riskScore": round(risk_score, 2),
            "weeklyPremium": round(weekly_premium, 2),
            "coverageAmount": round(coverage_amount, 2),
            "riskFactors": {
                "weatherRisk": round((rainfall > 50) * 20 + (temperature > 35) * 15, 2),
                "pollutionRisk": round(min(aqi / 10, 30), 2),
                "floodRisk": round(flood_risk * 25, 2),
                "locationRisk": round(np.random.random() * 10, 2),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk calculation error: {str(e)}")

@app.post("/check-fraud")
async def check_fraud(request: FraudRequest):
    try:
        # Extract fraud detection features
        trigger_type = request.triggerEvent.get('type', 'unknown')

        # Generate behavioral features (in production, analyze historical data)
        claim_frequency = np.random.poisson(0.5)
        location_consistency = np.random.beta(2, 1)
        time_pattern = np.random.beta(2, 1)
        amount_consistency = np.random.beta(2, 1)

        # Check for obvious fraud indicators
        gps_spoof = np.random.random() < 0.05
        duplicate_claim = np.random.random() < 0.03
        unusual_timing = trigger_type in ['curfew'] and np.random.random() < 0.8  # High suspicion for curfew claims
        location_anomaly = np.random.random() < 0.08

        features = {
            'claim_frequency': claim_frequency,
            'location_consistency': location_consistency,
            'time_pattern': time_pattern,
            'amount_consistency': amount_consistency,
            'gps_spoof': float(gps_spoof),
            'duplicate_claim': float(duplicate_claim),
            'unusual_timing': float(unusual_timing),
            'location_anomaly': float(location_anomaly)
        }

        fraud_probability = fraud_model.predict_fraud(features)
        is_fraud = fraud_probability > 0.4  # Threshold

        reasons = []
        if is_fraud:
            if gps_spoof:
                reasons.append("GPS location spoofing detected")
            if duplicate_claim:
                reasons.append("Duplicate claim pattern")
            if unusual_timing:
                reasons.append("Unusual timing for claim")
            if location_anomaly:
                reasons.append("Location inconsistency")
            if fraud_probability > 0.7:
                reasons.append("High fraud probability")

        return {
            "passed": not is_fraud,
            "probability": round(fraud_probability, 3),
            "reasons": reasons
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fraud check error: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models": {
            "risk_assessment": risk_model.is_trained,
            "fraud_detection": fraud_model.is_trained
        }
    }

@app.get("/model-info")
async def model_info():
    return {
        "risk_model": {
            "type": "RandomForestRegressor",
            "features": ["latitude", "longitude", "rainfall", "temperature", "humidity", "aqi", "flood_risk", "income", "platform_factor"],
            "trained": risk_model.is_trained
        },
        "fraud_model": {
            "type": "RandomForestClassifier",
            "features": ["claim_frequency", "location_consistency", "time_pattern", "amount_consistency", "gps_spoof", "duplicate_claim", "unusual_timing", "location_anomaly"],
            "trained": fraud_model.is_trained
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)