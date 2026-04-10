# LiveSign Deployment Guide

## 🗃️ Database Migrations

### Automatic Migration Checking

The build process now includes automatic migration checking via `npm run db:migrate`. This script:

- ✅ Lists available migrations during build
- ✅ Provides guidance on running them manually
- ✅ Never fails the build due to migration issues

### Manual Migration Process (Recommended)

1. **Navigate to Supabase SQL Editor**
2. **Run migrations in order:**
   ```sql
   -- Copy and paste from supabase/migrations/001_initial_schema.sql
   -- Then 002_digital_signage.sql
   -- Then 003_fix_rls_recursion.sql
   -- etc.
   ```

### Current Migrations

- `001_initial_schema.sql` - User management and organizations
- `002_digital_signage.sql` - Content, slideshows, display tracking
- `003_fix_rls_recursion.sql` - Fix RLS policy infinite recursion

## 🚀 Deployment Process

1. **Push to main branch**
2. **GitHub Actions** will trigger (optional validation)
3. **Vercel** auto-deploys the application
4. **Check migration status** in build logs
5. **Run any pending migrations** manually in Supabase

## 🔄 Future: Automatic Migrations

To enable fully automatic migrations:

1. **Install Supabase CLI** in your CI/CD
2. **Configure project linking** with environment variables
3. **Run `supabase db push`** before deployment

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Check migrations (dry run)
npm run db:migrate

# Type checking
npm run type-check

# Build for production
npm run build
```

## 📋 Environment Variables

### Required for Vercel Deployment

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Optional for GitHub Actions

```bash
SUPABASE_ACCESS_TOKEN=sbp_xxx
SUPABASE_PROJECT_REF=xxx
SUPABASE_DB_PASSWORD=xxx
```

## 🎯 Migration Best Practices

1. **Always run migrations in order**
2. **Test migrations on staging first**
3. **Keep migrations idempotent** (safe to run multiple times)
4. **Never edit existing migration files** (create new ones)
5. **Include rollback instructions** in comments

## 🆘 Troubleshooting

### Migration Errors
- Check Supabase logs for detailed error messages
- Ensure policies don't create circular dependencies
- Verify table dependencies are created in correct order

### Build Failures
- Check migration syntax in SQL files
- Verify all environment variables are set
- Review Vercel build logs for specific errors

### RLS Policy Issues
- Test policies with simple cases first
- Avoid checking the same table you're inserting into
- Use `auth.uid()` and `auth.role()` functions safely