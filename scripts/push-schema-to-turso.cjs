const { createClient } = require('@libsql/client')
const fs = require('fs')
const path = require('path')

const TURSO_URL = 'libsql://divine-travel-kjassi435.aws-ap-south-1.turso.io'
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODA2NTg4ODIsImlkIjoiMDE5ZTk3OGEtMmMwMS03Njg1LThmMGUtNTcwMDgwNWIxYTM5IiwicmlkIjoiYmNkZTIxZWEtYTI2ZC00NmZjLTk4ZGQtMzdmNmMzMDcyZjEyIn0.NEHCs52RMXdFpXDdv1SIJc_7K8ZaeE9thDOTDzFCWlGRHKbKGcD7AX-nKXyy7KDdnfSaED9KKANkRszVaSp4BQ'

const sqlPath = path.join(__dirname, '..', 'prisma', 'schema.sql')
const rawSql = fs.readFileSync(sqlPath, 'utf-8')

// Remove comment lines
const sql = rawSql
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')

async function main() {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN })
  console.log('Connected to Turso')

  // Use executeMultiple which handles multiple statements
  try {
    await client.execute(sql)
    console.log('Schema applied successfully via executeMultiple!')
  } catch (err) {
    console.error('executeMultiple failed, falling back to single-statement mode:', err.message)
    // Fallback: split on ;
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    console.log(`Executing ${statements.length} statements one by one...`)
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      try {
        await client.execute(stmt + ';')
      } catch (e) {
        console.error(`  ✗ Failed at ${i + 1}: ${stmt.substring(0, 60)}...`)
        throw e
      }
    }
    console.log('Schema applied via individual statements!')
  }

  // Verify
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  console.log(`\nTables in Turso DB (${tables.rows.length}):`)
  for (const row of tables.rows) {
    console.log('  -', row.name)
  }

  client.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
