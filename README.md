# GigArmor - Parametric Insurance Platform

A comprehensive AI-powered parametric insurance platform designed specifically for gig delivery workers in India, protecting them against income loss due to external disruptions.

## 🚀 Features

### Core Features
- **Worker Onboarding**: Complete registration with location capture and income tracking
- **AI Risk Assessment**: Machine learning models calculate personalized risk scores
- **Parametric Triggers**: Automatic claim generation based on real-time environmental data
- **Fraud Detection**: Intelligent monitoring to prevent fraudulent claims
- **Instant Payouts**: Mock payment system for immediate claim settlements
- **Dual Dashboards**: Separate interfaces for workers and administrators

### Technical Features
- **Microservices Architecture**: Separated AI service for scalability
- **Real-time Monitoring**: Hourly checks for trigger conditions
- **Secure Authentication**: JWT-based auth with role-based access
- **Responsive Design**: Modern UI built with TailwindCSS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Express.js    │    │   FastAPI       │
│   Frontend      │◄──►│   Backend API   │◄──►│   AI Service    │
│                 │    │                 │    │                 │
│ - Worker/Admin  │    │ - Auth & Users  │    │ - Risk Models   │
│   Dashboards    │    │ - Policies      │    │ - Fraud Detect  │
│ - Responsive UI │    │ - Claims        │    │ - ML Inference  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MongoDB       │
                    │   Database      │
                    │                 │
                    │ - Users         │
                    │ - Policies      │
                    │ - Claims        │
                    └─────────────────┘
```

## 📁 Project Structure

```
GigArmor/
├── frontend/              # Next.js React application
│   ├── app/              # Next.js 13+ app directory
│   ├── components/       # Reusable React components
│   └── package.json
├── backend/              # Express.js API server
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── services/        # Business logic
│   └── server.js
├── ai-service/          # Python FastAPI microservice
│   ├── main.py         # FastAPI application
│   └── requirements.txt
├── database/           # Database schemas and migrations
├── docs/              # Documentation
└── scripts/           # Deployment and utility scripts
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with app router
- **TailwindCSS**: Utility-first CSS framework
- **Chart.js**: Data visualization
- **Axios**: HTTP client

### Backend
- **Node.js + Express**: REST API server
- **MongoDB + Mongoose**: NoSQL database
- **JWT**: Authentication
- **Winston**: Logging
- **Helmet**: Security middleware

### AI Service
- **Python + FastAPI**: High-performance API
- **Scikit-learn**: Machine learning
- **Pydantic**: Data validation

### External APIs
- **OpenWeather API**: Weather data
- **AQI API**: Air quality data
- **Mock Services**: Flood and curfew data

## 🚀 Quick Start

### Option 1: Docker (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Clone and navigate to project
cd gigarmor

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

**Services will be available at:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000
- MongoDB: localhost:27017

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f frontend
```

### Option 2: Manual Setup
- Node.js 18+
- Python 3.8+
- MongoDB 5.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/gigarmor.git
   cd gigarmor
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup AI Service**
   ```bash
   cd ../ai-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

5. **Setup Database**
   ```bash
   # Make sure MongoDB is running
   mongosh
   use gigarmor
   ```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gigarmor
JWT_SECRET=your_jwt_secret_key_here
AI_SERVICE_URL=http://localhost:8000
```

#### AI Service
```env
# Add any required API keys for external services
OPENWEATHER_API_KEY=your_key_here
AQI_API_KEY=your_key_here
```

## 📊 API Documentation

### Base URL
```
Backend: http://localhost:5000/api
AI Service: http://localhost:8000
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-------------|
| POST | `/api/auth/register` | Register new worker | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/health` | Health check | No |

#### POST /api/auth/register
Register a new worker user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+919999999999",
  "deliveryPlatform": "swiggy",
  "averageWeeklyIncome": 5000,
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "Mumbai, Maharashtra"
  }
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "worker",
    "riskScore": 0
  }
}
```

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "worker"
  }
}
```

### Worker Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-------------|
| GET | `/api/workers/profile` | Get worker profile | Yes |
| PUT | `/api/workers/profile` | Update worker profile | Yes |
| POST | `/api/workers/calculate-risk` | Calculate risk score | Yes |
| POST | `/api/workers/purchase-policy` | Purchase insurance policy | Yes |
| GET | `/api/workers/policies` | Get worker policies | Yes |
| GET | `/api/workers/claims` | Get worker claims | Yes |

#### POST /api/workers/calculate-risk
Calculate personalized risk score and premium.

**Request Body:**
```json
{
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "deliveryPlatform": "swiggy",
  "averageWeeklyIncome": 5000
}
```

**Response:**
```json
{
  "riskScore": 45.5,
  "weeklyPremium": 95.5,
  "coverageAmount": 3500,
  "riskFactors": {
    "weatherRisk": 15,
    "pollutionRisk": 12.5,
    "floodRisk": 8,
    "locationRisk": 5
  }
}
```

#### POST /api/workers/purchase-policy
Purchase an insurance policy.

**Request Body:**
```json
{
  "weeklyPremium": 95.5,
  "coverageAmount": 3500,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Policy Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-------------|
| GET | `/api/policies` | Get all policies (admin) | Yes (Admin) |
| GET | `/api/policies/:id` | Get policy by ID | Yes |
| GET | `/api/policies/worker/:workerId` | Get policies by worker | Yes |
| GET | `/api/policies/calculate/:workerId` | Calculate premium | Yes |

### Claims Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-------------|
| GET | `/api/claims` | Get all claims (admin) | Yes (Admin) |
| GET | `/api/claims/worker/:workerId` | Get claims by worker | Yes |
| GET | `/api/claims/:id` | Get claim by ID | Yes |
| PUT | `/api/claims/:id/status` | Update claim status | Yes (Admin) |
| POST | `/api/claims/:id/payout` | Process payout | Yes (Admin) |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics | Yes (Admin) |
| GET | `/api/admin/users` | Get all users | Yes (Admin) |
| GET | `/api/admin/fraud-alerts` | Fraud detection alerts | Yes (Admin) |
| GET | `/api/admin/risk-heatmap` | Risk heatmap data | Yes (Admin) |
| GET | `/api/admin/analytics/revenue` | Revenue analytics | Yes (Admin) |
| GET | `/api/admin/analytics/claims` | Claims analytics | Yes (Admin) |

#### GET /api/admin/dashboard

**Response:**
```json
{
  "totalWorkers": 150,
  "activePolicies": 120,
  "totalRevenue": 125000,
  "pendingClaims": 5,
  "paidClaims": 45,
  "fraudAlerts": 2,
  "riskDistribution": {
    "low": 60,
    "medium": 45,
    "high": 15
  }
}
```

### AI Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/calculate-risk` | Risk assessment |
| POST | `/check-fraud` | Fraud detection |
| GET | `/health` | Health check |
| GET | `/model-info` | Model information |

#### POST /calculate-risk

**Request Body:**
```json
{
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "deliveryPlatform": "swiggy",
  "averageWeeklyIncome": 5000
}
```

**Response:**
```json
{
  "riskScore": 45.5,
  "weeklyPremium": 95.5,
  "coverageAmount": 3500,
  "riskFactors": {
    "weatherRisk": 15,
    "pollutionRisk": 12.5,
    "floodRisk": 8,
    "locationRisk": 5
  }
}
```

#### POST /check-fraud

**Request Body:**
```json
{
  "workerId": "507f1f77bcf86cd799439011",
  "triggerEvent": {
    "type": "rainfall",
    "value": 65.5,
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777
    },
    "timestamp": "2024-01-15T10:30:00Z"
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
  "probability": 0.15,
  "reasons": []
}
```

### Error Responses

All endpoints may return the following error responses:

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

## 🔄 System Workflow

### 1. Worker Registration & Onboarding
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Worker      │────►│  Backend     │────►│  MongoDB     │
│  Submits     │     │  Validates   │     │  Stores      │
│  Form        │     │  & Saves     │     │  User        │
└──────────────┘     └──────────────┘     └──────────────┘
```
- User provides personal details, location, delivery platform
- System captures GPS coordinates (or manual entry)
- Stores worker profile in MongoDB

### 2. AI Risk Assessment
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Backend     │────►│  AI Service   │────►│  Risk Model  │
│  Sends Data  │     │  Receives    │────►│  Calculates  │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Returns     │
                    │  Score &     │
                    │  Premium     │
                    └──────────────┘
```
- AI service analyzes location, weather patterns, historical data
- Random Forest model calculates personalized risk score (0-100)
- Premium calculated based on risk score and income

### 3. Policy Purchase
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Worker      │────►│  Backend     │────►│  Policy      │
│  Reviews     │     │  Creates     │────►│  Active      │
│  & Pays      │     │  Policy      │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```
- Worker reviews coverage and premium
- Completes payment (mock in demo)
- Policy stored in database with 7-day validity

### 4. Automatic Monitoring (Hourly)
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Trigger     │────►│  External    │────►│  Check       │
│  Service     │     │  APIs        │────►│  Thresholds  │
│  (Hourly)    │     │  (Weather)   │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Trigger     │
                    │  Conditions  │
                    │  Met?        │
                    └──────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌──────────────┐         ┌──────────────┐
       │  NO          │         │  YES         │
       │  Continue    │         │  Create      │
       │  Monitoring  │         │  Claim       │
       └──────────────┘         └──────────────┘
```
- System checks weather, AQI, flood data hourly
- Trigger conditions:
  - Rainfall > 50mm
  - Temperature > 45°C
  - AQI > 350
  - Flood alert
  - Curfew active

### 5. Claim Processing
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Claim       │────►│  Fraud       │────►│  AI          │
│  Created     │     │  Detection   │────►│  Validates   │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌──────────────┐         ┌──────────────┐
       │  FAILED      │         │  PASSED      │
       │  Manual     │         │  Auto        │
       │  Review     │         │  Payout      │
       └──────────────┘         └──────────────┘
```
- Fraud detection algorithms validate claim
- GPS consistency, claim frequency, anomaly detection
- Automatic payout (70% of coverage) for valid claims

### 6. Dashboard Updates
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  MongoDB     │────►│  Backend     │────►│  Frontend    │
│  Updated     │     │  Serves      │────►│  Real-time   │
│              │     │  Data        │     │  Updates     │
└──────────────┘     └──────────────┘     └──────────────┘
```
- Real-time updates for workers and admins
- Charts and analytics on dashboards

### Trigger Threshold Configuration

| Trigger Type | Threshold | Payout |
|-------------|-----------|--------|
| Rainfall | > 50mm/24h | 70% of coverage |
| Temperature | > 45°C | 70% of coverage |
| AQI | > 350 | 70% of coverage |
| Flood | Alert detected | 70% of coverage |
| Curfew | Any curfew | 70% of coverage |

## 🛡️ Adversarial Defense & Anti-Spoofing Strategy

### 🚨 Threat Scenario
A coordinated fraud ring can exploit GPS spoofing to fake presence in high-risk zones and trigger mass payouts, draining the platform’s liquidity.

GigArmor is designed assuming attackers are intelligent and coordinated, not isolated users.

---

### 🧠 1. Differentiation: Real Worker vs Spoofer

The system does not rely solely on GPS. Instead, it uses multiple behavioral and contextual signals to distinguish genuine users from spoofed ones.

- **Movement Consistency**
  - Genuine workers show continuous and realistic movement patterns
  - Spoofed users exhibit static positions or sudden unrealistic jumps

- **Speed & Route Validation**
  - Movement is validated against real-world road constraints
  - Impossible transitions (teleportation-like movement) are flagged

- **Session Activity**
  - Genuine users actively interact with the app during work
  - Spoofed sessions often remain idle while location changes

- **Behavioral History**
  - Normal work patterns vs sudden abnormal spikes in activity

The system computes a fraud score based on these signals.

---

### 📊 2. Data Points Used for Fraud Detection

To detect coordinated fraud rings, the platform analyzes multiple data layers:

- **Location Data**
  - GPS coordinates
  - IP-based location
  - Location drift patterns

- **Device Data**
  - Device fingerprint (device ID, OS, app version)
  - Multiple accounts using the same device

- **Network Data**
  - IP clustering
  - VPN / proxy detection

- **Behavioral Data**
  - App usage patterns
  - Claim frequency and timing
  - Session activity consistency

- **Pattern Analysis**
  - Multiple users triggering claims simultaneously
  - Similar behavioral patterns across accounts

---

### ⚖️ 3. UX Balance (Handling Flagged Claims)

The system uses a risk-based approach to ensure genuine users are not penalized:

| Risk Level | Action |
|-----------|--------|
| Low Risk  | Instant claim approval |
| Medium Risk | Soft verification (additional checks) |
| High Risk | Claim temporarily held for review |

This approach ensures:
- Genuine workers receive payouts without friction
- Suspicious activity is controlled without false rejection

---

### 🧠 Decision Flow

User Data → Fraud Detection → Risk Score → Action

- Low Risk → Auto approve  
- Medium Risk → Verify  
- High Risk → Hold  

---

### 🚀 Outcome

- Prevents large-scale coordinated fraud attacks  
- Protects system liquidity  
- Maintains trust for genuine users  
- Provides a scalable and resilient insurance system  

## 🤖 AI Models

### Risk Assessment Model
- **Input**: Location coordinates, delivery platform, income
- **Features**: Weather patterns, pollution levels, flood history
- **Output**: Risk score (0-100), recommended premium

### Fraud Detection Model
- **Input**: Claim details, location data, timing patterns
- **Features**: GPS consistency, claim frequency, anomaly detection
- **Output**: Fraud probability, risk flags

## 🔒 Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet security headers

## 📈 Monitoring & Analytics

### Admin Dashboard Metrics
- Total active policies and revenue
- Claims ratio and processing times
- Fraud detection statistics
- Risk distribution heatmap
- Real-time disruption monitoring

### Worker Dashboard
- Policy status and coverage details
- Claims history and payout tracking
- Risk score visualization
- Premium payment history

## 🚀 Deployment

### Production Setup
1. **Database**: MongoDB Atlas or self-hosted
2. **Backend**: Deploy to Heroku, Railway, or VPS
3. **AI Service**: Deploy to Railway, Render, or cloud VM
4. **Frontend**: Deploy to Vercel or Netlify

### Docker Support
```dockerfile
# Add Dockerfiles for containerized deployment
```

## 🔮 Future Enhancements

### Phase 2 Features
- **Real Payment Integration**: Razorpay/Stripe integration
- **Mobile App**: React Native companion app
- **Advanced AI**: Deep learning for better predictions
- **Multi-language Support**: Hindi, Tamil, regional languages
- **Partner Integrations**: Direct API with delivery platforms

### Technical Improvements
- **Microservices**: Break down monolithic components
- **Event Streaming**: Kafka for real-time data processing
- **Caching**: Redis for performance optimization
- **Monitoring**: ELK stack for logging and metrics
- **Load Balancing**: Nginx for traffic distribution

### Business Expansion
- **New Markets**: Expand to other gig economy sectors
- **Custom Policies**: Flexible coverage options
- **Group Insurance**: Company-wide coverage plans
- **Data Analytics**: Advanced business intelligence

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@gigarmor.com or join our Slack community.

---

**Built with ❤️ for gig workers in India**