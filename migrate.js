const { createClient } = require('@libsql/client')
require('dotenv').config()

const c = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

async function main() {
  try {
    await c.execute('ALTER TABLE Package ADD COLUMN pickupLocationUrl TEXT NOT NULL DEFAULT ""')
    console.log('Added pickupLocationUrl column')
  } catch(e) {
    console.log('Column may already exist:', e.message)
  }
}

main()
