# Database Schema Design

## Overview
GigArmor uses MongoDB as the primary database with Mongoose ODM for schema definition and data validation.

## Collections

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String (required),
  role: String (enum: ['worker', 'admin'], default: 'worker'),
  location: {
    latitude: Number (required),
    longitude: Number (required),
    address: String (required)
  },
  deliveryPlatform: String (enum: ['swiggy', 'zomato', 'zepto', 'amazon', 'other'], required),
  averageWeeklyIncome: Number (required),
  riskScore: Number (default: 0),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `{ email: 1 }` (unique)
- `{ role: 1 }`

### 2. Policies Collection
```javascript
{
  _id: ObjectId,
  workerId: ObjectId (ref: 'User', required),
  weeklyPremium: Number (required),
  coverageAmount: Number (required),
  startDate: Date (required),
  endDate: Date (required),
  status: String (enum: ['active', 'expired', 'cancelled'], default: 'active'),
  riskFactors: {
    weatherRisk: Number (default: 0),
    pollutionRisk: Number (default: 0),
    floodRisk: Number (default: 0),
    locationRisk: Number (default: 0)
  },
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `{ workerId: 1 }`
- `{ status: 1 }`
- `{ endDate: 1 }`

### 3. Claims Collection
```javascript
{
  _id: ObjectId,
  policyId: ObjectId (ref: 'Policy', required),
  workerId: ObjectId (ref: 'User', required),
  triggerEvent: {
    type: String (enum: ['rainfall', 'temperature', 'aqi', 'flood', 'curfew'], required),
    value: Number (required),
    location: {
      latitude: Number (required),
      longitude: Number (required)
    },
    timestamp: Date (required)
  },
  payoutAmount: Number (required),
  status: String (enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending'),
  fraudCheck: {
    passed: Boolean (default: true),
    reasons: [String]
  },
  paymentId: String, // For payment integration
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `{ policyId: 1 }`
- `{ workerId: 1 }`
- `{ status: 1 }`
- `{ 'triggerEvent.timestamp': 1 }`
- `{ 'fraudCheck.passed': 1 }`

## Relationships

### User → Policy (One-to-Many)
- One worker can have multiple policies over time
- Active policy constraint: Only one active policy per worker at a time

### Policy → Claim (One-to-Many)
- One policy can generate multiple claims
- Claims are linked to specific trigger events

### User → Claim (One-to-Many)
- One worker can have multiple claims across different policies

## Data Validation Rules

### User Validation
- Email format validation
- Phone number format (Indian mobile numbers)
- Location coordinates within India bounds
- Average weekly income > 0

### Policy Validation
- Coverage amount ≤ average weekly income
- End date > start date
- Weekly premium > 0

### Claim Validation
- Payout amount ≤ policy coverage amount
- Trigger event data matches defined thresholds
- No duplicate claims for same trigger within 24 hours

## Indexing Strategy

### Performance Indexes
1. **Compound Indexes for Queries:**
   - `{ workerId: 1, status: 1 }` for active policies lookup
   - `{ 'triggerEvent.timestamp': -1, status: 1 }` for recent claims

2. **Geospatial Indexes:**
   - `{ 'location': '2dsphere' }` for location-based queries

3. **Text Indexes:**
   - `{ name: 'text', email: 'text' }` for user search

### TTL Indexes
- Claims older than 2 years: `{ createdAt: 1 }` with TTL
- Expired policies: `{ endDate: 1 }` with TTL

## Data Archival Strategy

### Archive Criteria
- Claims older than 1 year → archive collection
- Cancelled policies older than 6 months → archive
- Inactive users (no login > 1 year) → archive

### Archive Process
- Move to `claims_archive`, `policies_archive`, `users_archive`
- Compress archived data
- Maintain referential integrity in archives

## Backup Strategy

### Daily Backups
- Full database backup at 2 AM IST
- Incremental backups every 6 hours
- Retain daily backups for 30 days

### Disaster Recovery
- Point-in-time recovery capability
- Cross-region backup replication
- 4-hour RTO, 1-hour RPO targets

## Migration Strategy

### Version Control
- Schema versions tracked in `schema_versions` collection
- Migration scripts in `/database/migrations/`
- Rollback capability for all migrations

### Zero-Downtime Migrations
- Blue-green deployment for schema changes
- Backward compatibility maintained during transitions
- Feature flags for gradual rollouts

## Security Considerations

### Data Encryption
- Sensitive fields encrypted at rest
- TLS 1.3 for data in transit
- Field-level encryption for PII data

### Access Control
- Role-based access at database level
- Principle of least privilege
- Audit logging for all data access

### Data Retention
- GDPR compliance for EU users
- Data minimization principles
- Automatic data purging for expired records