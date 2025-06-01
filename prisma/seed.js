import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Seed Users
  await prisma.url.createMany({
    data: [
      { longUrl: 'https://www.w3schools.com/mysql/', shortUrl: 'shorUrl1' },
      { longUrl: 'https://www.google.com/', shortUrl: 'shorUrl2' },
      { longUrl: 'https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing#failed-migration', shortUrl: 'shorUrl3' },
    ],
  })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    }
    )
