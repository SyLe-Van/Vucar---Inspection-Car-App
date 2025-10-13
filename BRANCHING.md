# 🌿 Branching Strategy

## Branch Structure

### 🚀 **main** (Production)

- **Environment:** Production
- **Database:** `vucar_production` collection
- **URL:** `https://vucar.syledevops.live`
- **Deployment:** Auto-deploy via Jenkins
- **Security:** Production secrets

### 🔧 **dev** (Development)

- **Environment:** Development
- **Database:** `vucar_development` collection
- **URL:** `http://localhost:3000`
- **Deployment:** Manual testing
- **Security:** Development secrets

## Environment Configuration

### Development (dev branch):

- **File:** `.env.local`
- **Database:** `vucar_development`
- **URL:** `http://localhost:3000`

```bash
NODE_ENV=development
MONGODB_URL=...vucar_development...
NEXTAUTH_URL=http://localhost:3000
DEBUG=true
LOG_LEVEL=debug
```

### Production (main branch):

- **File:** `.env.production`
- **Database:** `vucar_production`
- **URL:** `https://vucar.syledevops.live`

```bash
NODE_ENV=production
MONGODB_URL=...vucar_production...
NEXTAUTH_URL=https://vucar.syledevops.live
DEBUG=false
LOG_LEVEL=info
```

## Workflow

1. **Development:** Work on `dev` branch
2. **Testing:** Test on development environment
3. **Merge:** `dev` → `main` when ready for production
4. **Deploy:** Jenkins auto-deploys `main` branch

## Commands

```bash
# Switch to development
git checkout dev
npm run dev

# Switch to production
git checkout main
npm run build && npm start
```
