# Database Migrations Guide

## Overview

This directory contains database migration scripts for the VuCar application. Migrations are used to update the database schema when deploying new features to production.

## Available Migrations

### 1. add-license-plate-field.js

**Date:** 2025-10-15  
**Purpose:** Adds `licensePlate` field to the Car collection with sparse unique index

**What it does:**

- Adds `licensePlate` field to all existing cars (set to null)
- Creates a sparse unique index on `licensePlate`
- Allows multiple null values (backward compatibility)
- Ensures unique license plates for cars that have them

## How to Run Migrations

### Option 1: Using the Migration Runner (Recommended)

```bash
# Make the script executable
chmod +x scripts/run-migration.sh

# Run migration with MongoDB URI from environment
export MONGODB_URI="your-production-mongodb-uri"
./scripts/run-migration.sh add-license-plate-field

# Or provide URI directly
./scripts/run-migration.sh add-license-plate-field "mongodb+srv://user:pass@cluster.mongodb.net/dbname"
```

### Option 2: Run Migration Directly

```bash
cd scripts/migrations
node add-license-plate-field.js "your-production-mongodb-uri"
```

## Production Deployment Checklist

When deploying code with database changes:

### Step 1: Backup Production Database

```bash
# If using MongoDB Atlas, create a snapshot in the web interface
# Or use mongodump
mongodump --uri="your-mongodb-uri" --out="backup-$(date +%Y%m%d)"
```

### Step 2: Test Migration on Staging

```bash
# Test on staging environment first
export MONGODB_URI="your-staging-mongodb-uri"
./scripts/run-migration.sh add-license-plate-field
```

### Step 3: Run Migration on Production

```bash
# Connect to production database
export MONGODB_URI="your-production-mongodb-uri"
./scripts/run-migration.sh add-license-plate-field
```

### Step 4: Deploy Application Code

```bash
# After migration succeeds, deploy the code
git checkout main
git pull origin main
# Deploy using your CI/CD or manual deployment process
```

## Safety Features

✅ **Confirmation Required:** Script asks for confirmation before running  
✅ **Logging:** All migrations are logged to `scripts/logs/`  
✅ **Error Handling:** Exits on first error  
✅ **Idempotent:** Can be run multiple times safely  
✅ **Backward Compatible:** Existing cars work with null licensePlate

## Migration Logs

Logs are saved in `scripts/logs/` with timestamp:

```
scripts/logs/add-license-plate-field_20251015_143022.log
```

## Troubleshooting

### Error: Duplicate Key Error

**Cause:** Multiple cars have the same license plate  
**Solution:** Find and fix duplicates before running migration

```bash
# Find duplicates in MongoDB
db.cars.aggregate([
  { $match: { licensePlate: { $ne: null } } },
  { $group: { _id: "$licensePlate", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

### Error: Cannot Connect to Database

**Cause:** Incorrect MongoDB URI or network issue  
**Solution:**

- Check MongoDB URI is correct
- Verify network access (whitelist IP in MongoDB Atlas)
- Test connection: `mongosh "your-mongodb-uri"`

### Migration Already Applied

**Result:** Script will show "0 documents updated" - this is normal  
**Action:** No action needed, migration is idempotent

## Creating New Migrations

1. Create new file in `scripts/migrations/`:

```bash
touch scripts/migrations/your-migration-name.js
```

2. Use this template:

```javascript
const mongoose = require("mongoose");

async function migrate() {
  const MONGODB_URI = process.argv[2];

  if (!MONGODB_URI) {
    console.error("Usage: node your-migration-name.js <MONGODB_URI>");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    // Your migration logic here

    await mongoose.connection.close();
    console.log("✅ Migration completed");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
```

3. Test locally first:

```bash
node scripts/migrations/your-migration-name.js "mongodb://localhost:27017/vucar"
```

## Best Practices

1. **Always backup before migration**
2. **Test on staging first**
3. **Run migrations before deploying code**
4. **Keep migrations small and focused**
5. **Make migrations reversible when possible**
6. **Document what each migration does**
7. **Never modify existing migrations after they're run**

## MongoDB Atlas Production Steps

For MongoDB Atlas users:

1. **Create Snapshot** (Atlas UI → Backup → Create Snapshot)
2. **Whitelist IP** (Atlas UI → Network Access → Add IP)
3. **Get Connection String** (Atlas UI → Connect → Connect your application)
4. **Run Migration** (Use connection string from step 3)
5. **Verify** (Check data in Atlas UI → Collections)
6. **Deploy Code** (After successful migration)

## Support

If you encounter issues:

- Check migration logs in `scripts/logs/`
- Review error messages carefully
- Test on local/staging first
- Contact DevOps team for production issues
