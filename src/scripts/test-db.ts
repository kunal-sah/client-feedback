import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Successfully connected to the database')

    // Create a test company
    const company = await prisma.company.create({
      data: {
        name: 'Test Company',
        subscriptionTier: 'BASIC',
        status: 'ACTIVE'
      }
    })
    console.log('Created test company:', company)

    // Query the company
    const companies = await prisma.company.findMany()
    console.log('All companies:', companies)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 