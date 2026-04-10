const fs = require('fs')
const path = require('path')

console.log('🗃️  Database Migration Check')

// Check if we're in a build environment
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('⏭️  Skipping migrations - no Supabase URL configured')
  process.exit(0)
}

// List available migrations
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')

if (!fs.existsSync(migrationsDir)) {
  console.log('📁 No migrations directory found - skipping')
  process.exit(0)
}

const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort()

console.log(`📋 Found ${migrationFiles.length} migration files:`)
migrationFiles.forEach(file => {
  console.log(`   - ${file}`)
})

console.log(`
🔗 To run migrations manually:
   1. Go to Supabase SQL Editor
   2. Copy and paste the content of each migration file
   3. Execute them in order

⚡ For automatic migrations, we recommend:
   1. Using Supabase CLI in your CI/CD pipeline
   2. Or running migrations manually during deployment

🚀 Build continuing...
`)

process.exit(0)