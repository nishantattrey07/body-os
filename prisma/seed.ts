import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const INITIAL_INVENTORY = [
    { name: "Whey Scoop", icon: "Milk", proteinPerUnit: 24, caloriesPerUnit: 120, volumePerUnit: 1, defaultUnit: "scoop" },
    { name: "Soya Chunk", icon: "Beef", proteinPerUnit: 26, caloriesPerUnit: 180, volumePerUnit: 50, defaultUnit: "g" },
    { name: "Paneer", icon: "Utensils", proteinPerUnit: 18, caloriesPerUnit: 260, volumePerUnit: 100, defaultUnit: "g" },
    { name: "Daliya", icon: "Wheat", proteinPerUnit: 5, caloriesPerUnit: 150, volumePerUnit: 1, defaultUnit: "bowl" },
    { name: "Milk Glass", icon: "Droplets", proteinPerUnit: 8, caloriesPerUnit: 120, volumePerUnit: 250, defaultUnit: "ml" },
    { name: "Cucumber", icon: "Leaf", proteinPerUnit: 1, caloriesPerUnit: 15, volumePerUnit: 1, defaultUnit: "piece" },
]

async function main() {
    console.log('Start seeding...')

    for (const item of INITIAL_INVENTORY) {
        const existing = await prisma.inventoryItem.findUnique({
            where: { name: item.name }
        })

        if (!existing) {
            await prisma.inventoryItem.create({
                data: item,
            })
            console.log(`Created item: ${item.name}`)
        } else {
            console.log(`Item already exists: ${item.name}`)
        }
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
