# GigArmor AI Service

A FastAPI-based microservice providing AI/ML capabilities for the GigArmor parametric insurance platform.

## Features

- **Risk Assessment Model**: Calculates worker risk scores based on location, environmental factors, and income
- **Fraud Detection Model**: Analyzes claims for fraudulent patterns and suspicious behavior
- **Real-time Processing**: Fast API responses for integration with the main backend
- **Containerized**: Docker-ready for easy deployment

## Models

### Risk Assessment Model
- **Algorithm**: Random Forest Regressor
- **Features**:
  - Location (latitude, longitude)
  - Environmental factors (rainfall, temperature, humidity, AQI)
  - Flood risk
  - Weekly income
  - Delivery platform factor
- **Output**: Risk score (0-100), weekly premium, coverage amount

### Fraud Detection Model
- **Algorithm**: Random Forest Classifier
- **Features**:
  - Claim frequency patterns
  - Location consistency
  - Time patterns
  - Amount consistency
  - GPS spoofing indicators
  - Duplicate claim detection
- **Output**: Fraud probability, pass/fail decision, reasons

## API Endpoints

### POST /calculate-risk
Calculate risk score and premium for a worker.

**Request Body:**
```json
{
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "deliveryPlatform": "swiggy",
  "averageWeeklyIncome": 1500
}
```

**Response:**
```json
{
  "riskScore": 45.67,
  "weeklyPremium": 72.83,
  "coverageAmount": 1050.0,
  "riskFactors": {
    "weatherRisk": 15.2,
    "pollutionRisk": 12.5,
    "floodRisk": 8.9,
    "locationRisk": 9.1
  }
}
```

### POST /check-fraud
Check claim for fraudulent patterns.

**Request Body:**
```json
{
  "workerId": "user123",
  "triggerEvent": {
    "type": "weather",
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  },
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  }
}
```

**Response:**
```json
{
  "passed": true,
  "probability": 0.123,
  "reasons": []
}
```

### GET /health
Health check endpoint.

### GET /model-info
Get information about trained models.

## Installation

### Local Development

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the service:
```bash
python main.py
```

### Docker

1. Build the image:
```bash
docker build -t gigarmor-ai .
```

2. Run the container:
```bash
docker run -p 8000:8000 gigarmor-ai
```

## Environment Variables

- `AI_SERVICE_URL`: URL of the AI service (default: http://localhost:8000)

## Model Training

Models are automatically trained on startup using synthetic data that simulates:
- Indian weather patterns
- Pollution levels in major cities
- Flood risk zones
- Worker income distributions
- Fraud patterns and detection scenarios

In production, models should be trained on real historical data.

## Dependencies

- fastapi: Web framework
- uvicorn: ASGI server
- scikit-learn: Machine learning
- pandas: Data processing
- numpy: Numerical computing
- pydantic: Data validation

## Health Checks

The service includes health checks that verify:
- Service availability
- Model training status
- API responsiveness

## Security

- Input validation using Pydantic
- Error handling with appropriate HTTP status codes
- Timeout handling for external calls
- No sensitive data logging

## Monitoring

- Request/response logging
- Model performance metrics
- Error tracking
- Health status endpoints