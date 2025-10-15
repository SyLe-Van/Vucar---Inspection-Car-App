# Winston Logging Implementation Guide

## Overview

Winston logging has been successfully implemented in the VuCar application with the following features:

- ✅ Structured JSON logging
- ✅ Daily log rotation
- ✅ Multiple log levels (error, warn, info, http, debug)
- ✅ Separate log files by category
- ✅ Colorized console output for development
- ✅ Request/Response logging middleware
- ✅ Database operation logging
- ✅ Error tracking with stack traces

## Implementation Details

### 1. Core Logger (`src/lib/logger/index.js`)

Main logger configuration with:

- **Winston transports**: Console, Daily Rotate Files
- **Log levels**: error, warn, info, http, debug
- **Specialized loggers**: apiLogger, dbLogger, businessLogger

### 2. Middleware (`src/lib/logger/middleware.js`)

Provides:

- `requestLogger`: Logs all API requests/responses
- `errorHandler`: Catches and logs errors
- `withLogging`: Combined middleware
- `morganMiddleware`: HTTP request logging with Morgan

### 3. Log Structure

```
logs/
├── application/
│   ├── app-2025-10-15.log      # General logs
│   └── error-2025-10-15.log    # Errors only
├── api/
│   └── requests-2025-10-15.log # HTTP requests
└── database/
    └── queries-2025-10-15.log  # DB operations
```

### 4. Log Retention

- Application logs: 14 days
- Error logs: 30 days
- API logs: 14 days
- Database logs: 7 days
- Max file size: 20MB

## Usage Examples

### Basic Logging

```javascript
import logger from "@/lib/logger";

// Info level
logger.info("User logged in", { userId: "123", email: "user@example.com" });

// Warning level
logger.warn("API rate limit approaching", { currentRate: 90 });

// Error level
logger.error("Payment failed", {
  error: error.message,
  orderId: "456",
  stack: error.stack,
});

// Debug level (development only)
logger.debug("Processing request", { data: requestData });
```

### API Logging

```javascript
import { apiLogger } from "@/lib/logger";

// Log API request
apiLogger.request(req, res, duration);

// Log API error
apiLogger.error(req, error);
```

### Database Logging

```javascript
import { dbLogger } from "@/lib/logger";

// Log connection
dbLogger.connection("connected", { database: "vucar", host: "mongodb.local" });

// Log query
dbLogger.query("find", "cars", 45, { filter: { status: "active" } });

// Log error
dbLogger.error("insert", error);
```

### Business Logic Logging

```javascript
import { businessLogger } from "@/lib/logger";

// Log car inspection
businessLogger.carInspection(carId, "passed", {
  inspector: "John Doe",
  duration: "15min",
});

// Log criteria check
businessLogger.criteriaCheck(criteriaId, "pass", {
  score: 95,
});
```

### Middleware Usage

```javascript
// In API route
import { withLogging } from "@/lib/logger/middleware";

async function handler(req, res) {
  // Your API logic
}

export default withLogging(handler);
```

## Viewing Logs

### Development

Logs are automatically displayed in the console with colors:

- 🔴 Red: Errors
- 🟡 Yellow: Warnings
- 🟢 Green: Info
- 🟣 Magenta: HTTP requests
- ⚪ White: Debug

### Production

View log files:

```bash
# Latest application logs
tail -f logs/application/app-$(date +%Y-%m-%d).log

# Error logs
tail -f logs/application/error-$(date +%Y-%m-%d).log

# API requests
tail -f logs/api/requests-$(date +%Y-%m-%d).log

# Database logs
tail -f logs/database/queries-$(date +%Y-%m-%d).log

# Search for errors
grep "error" logs/**/*.log

# Follow all logs
tail -f logs/**/*.log
```

## Log Format

### Console (Development)

```
2025-10-15 10:30:45 [info]: User logged in
{
  "userId": "123",
  "email": "user@example.com"
}
```

### File (JSON)

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2025-10-15 10:30:45",
  "userId": "123",
  "email": "user@example.com"
}
```

## Environment Variables

Configure logging via environment variables:

```env
# Log level (error, warn, info, http, debug)
LOG_LEVEL=info

# Enable/disable console logging
LOG_CONSOLE=true

# Log file directory
LOG_DIR=./logs
```

## Integration with Existing Code

### ✅ Already Updated

- `src/lib/database/db.js` - Database connection logging
- `src/pages/api/v1/car.js` - Car API logging
- `src/pages/api/health.js` - Health check logging

### 🔄 To Be Updated

- `src/pages/api/v1/criteria.js` - Add logging
- `src/pages/api/v1/inspection.js` - Add logging
- Server-side pages (SSR) - Add logging

## Best Practices

### DO ✅

- Log important business events
- Include context (userId, carId, etc.)
- Log errors with stack traces
- Use appropriate log levels
- Sanitize sensitive data (passwords, tokens)
- Add timestamps for all logs

### DON'T ❌

- Log sensitive data (passwords, credit cards)
- Log excessive data in production
- Use console.log (use logger instead)
- Log inside tight loops
- Commit log files to Git

## Performance Considerations

- Async logging (non-blocking)
- Log rotation prevents disk fill
- Debug level disabled in production
- Buffered writes for efficiency

## Troubleshooting

### Issue: Logs not appearing

**Solution:**

```bash
# Check log directory exists
mkdir -p logs/application logs/api logs/database

# Check file permissions
chmod 755 logs
```

### Issue: Log files too large

**Solution:**

- Logs auto-rotate at 20MB
- Old logs deleted after retention period
- Manually clean: `rm logs/**/*.log`

### Issue: Cannot read logs

**Solution:**

```bash
# Use jq for JSON logs
tail logs/application/app-2025-10-15.log | jq .

# Pretty print
cat logs/application/app-2025-10-15.log | jq -C . | less -R
```

## Next Steps

### Phase 2: Monitoring (Next Week)

- [ ] Prometheus metrics integration
- [ ] Grafana dashboard setup
- [ ] Alert configuration
- [ ] Performance tracking

### Phase 3: Error Tracking

- [ ] Sentry integration
- [ ] Source maps for production
- [ ] Error grouping and trends
- [ ] Automated notifications

## Support

For logging issues:

1. Check log files in `logs/` directory
2. Review console output in development
3. Verify environment variables
4. Check file permissions

---

**Implemented:** October 15, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
