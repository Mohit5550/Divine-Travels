import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS BlogCategory (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('+ Created BlogCategory table')
  } catch (e) {
    console.log('BlogCategory table error:', e instanceof Error ? e.message : e)
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Blog (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL DEFAULT '',
        featuredImage TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        categoryId TEXT,
        author TEXT NOT NULL DEFAULT 'Divine Travels',
        published INTEGER NOT NULL DEFAULT 0,
        publishedAt DATETIME,
        metaTitle TEXT,
        metaDescription TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES BlogCategory(id) ON DELETE SET NULL
      )
    `)
    console.log('+ Created Blog table')
  } catch (e) {
    console.log('Blog table error:', e instanceof Error ? e.message : e)
  }

  await prisma.$disconnect()
}

main()
