import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    console.log('🌱 Starting Body OS seed...')
    // ==============================================
    // 1. WARMUP CHECKLIST ITEMS
    // ==============================================
    console.log('Creating warmup checklist items...')
    const warmupItems = [
        { name: 'Wrist Rotations', order: 1, description: 'Rotate wrists clockwise and counter-clockwise, 30 reps each direction' },
        { name: 'Arm Circles', order: 2, description: 'Forward and backward arm circles, 20 reps each' },
        { name: 'Scapular Pull-ups', order: 3, description: 'Dead hang to active hang (shoulder depression), 10 reps' },
        { name: 'Dead Hang', order: 4, description: 'Hang from bar with core tight, 30-60 seconds' },
        { name: 'Deep Squat Hold', order: 5, description: 'Malasana pose, hold for 1 minute' },
        { name: 'Hollow Body Hold', order: 6, description: 'Lie on back, lift shoulders and legs, 30 seconds' },
    ]
    for (const item of warmupItems) {
        await prisma.warmupChecklist.upsert({
            where: { name: item.name },
            update: {},
            create: item,
        })
    }
    // ==============================================
    // 2. INVENTORY ITEMS (Food)
    // ==============================================
    console.log('Creating inventory food items...')
    const inventoryItems = [
        {
            name: 'Whey Scoop',
            icon: '🥛',
            proteinPerUnit: 24,
            carbsPerUnit: 3,
            fatPerUnit: 1,
            caloriesPerUnit: 120,
            volumePerUnit: 30,
            defaultUnit: 'scoop',
            isActive: true,
        },
        {
            name: '50g Soya Chunks',
            icon: '🥘',
            proteinPerUnit: 26,
            carbsPerUnit: 15,
            fatPerUnit: 0.5,
            caloriesPerUnit: 170,
            volumePerUnit: 50,
            defaultUnit: 'g',
            isActive: true,
            maxDailyQty: 2, // Max 100g per day (2 servings)
        },
        {
            name: '100g Paneer',
            icon: '🧀',
            proteinPerUnit: 18,
            carbsPerUnit: 1.2,
            fatPerUnit: 20,
            caloriesPerUnit: 265,
            volumePerUnit: 100,
            defaultUnit: 'g',
            isActive: true,
        },
        {
            name: 'Daliya Bowl',
            icon: '🥣',
            proteinPerUnit: 5,
            carbsPerUnit: 35,
            fatPerUnit: 2,
            caloriesPerUnit: 180,
            volumePerUnit: 100,
            defaultUnit: 'bowl',
            isActive: true,
        },
        {
            name: 'Cucumber',
            icon: '🥒',
            proteinPerUnit: 1,
            carbsPerUnit: 4,
            fatPerUnit: 0,
            caloriesPerUnit: 16,
            volumePerUnit: 100,
            defaultUnit: 'piece',
            isActive: true,
        },
        {
            name: '250ml Milk',
            icon: '🥛',
            proteinPerUnit: 8,
            carbsPerUnit: 12,
            fatPerUnit: 5,
            caloriesPerUnit: 120,
            volumePerUnit: 250,
            defaultUnit: 'ml',
            isActive: true,
        },
        {
            name: 'Curd Bowl',
            icon: '🥣',
            proteinPerUnit: 10,
            carbsPerUnit: 8,
            fatPerUnit: 4,
            caloriesPerUnit: 100,
            volumePerUnit: 200,
            defaultUnit: 'bowl',
            isActive: true,
        },
    ]
    for (const item of inventoryItems) {
        await prisma.inventoryItem.upsert({
            where: { name: item.name },
            update: {},
            create: item,
        })
    }
    // ==============================================
    // 3. EXERCISES (with Pain Swap Logic)
    // ==============================================
    console.log('Creating exercises with pain swap logic...')
    // First, create all exercises without swaps
    const exercises = [
        // PUSH
        { name: 'Incline Pushups', defaultReps: 15, defaultSets: 3, category: 'Push' },
        { name: 'Diamond Pushups', defaultReps: 10, defaultSets: 3, category: 'Push' },
        { name: 'Plank', defaultReps: 60, defaultSets: 3, category: 'Core' }, // Safe alternative
        { name: 'Pike Pushups', defaultReps: 12, defaultSets: 3, category: 'Push' },
        { name: 'Dips', defaultReps: 10, defaultSets: 3, category: 'Push' },
        // PULL
        { name: 'Pull-ups', defaultReps: 8, defaultSets: 4, category: 'Pull' },
        { name: 'Negative Pull-ups', defaultReps: 5, defaultSets: 4, category: 'Pull' },
        { name: 'Australian Rows', defaultReps: 12, defaultSets: 3, category: 'Pull' },
        { name: 'Dead Hangs', defaultReps: 60, defaultSets: 3, category: 'Pull' },
        // LEGS
        { name: 'Bodyweight Squats', defaultReps: 20, defaultSets: 3, category: 'Legs' },
        { name: 'Bulgarian Split Squats', defaultReps: 12, defaultSets: 3, category: 'Legs' },
        // CORE
        { name: 'Hollow Body Rocks', defaultReps: 20, defaultSets: 3, category: 'Core' },
        { name: 'Hanging Knee Raises', defaultReps: 12, defaultSets: 3, category: 'Core' },
    ]
    const createdExercises = []
    for (const exercise of exercises) {
        const created = await prisma.exercise.upsert({
            where: { name: exercise.name },
            update: {},
            create: exercise,
        })
        createdExercises.push(created)
    }
    // Now set up pain swap relationships
    console.log('Setting up pain swap relationships...')
    const diamondPushups = createdExercises.find(e => e.name === 'Diamond Pushups')
    const plank = createdExercises.find(e => e.name === 'Plank')
    if (diamondPushups && plank) {
        await prisma.exercise.update({
            where: { id: diamondPushups.id },
            data: { swapExerciseId: plank.id },
        })
    }
    // ==============================================
    // 4. WORKOUT ROUTINES
    // ==============================================
    console.log('Creating workout routines...')
    // Push Day
    const pushRoutine = await prisma.workoutRoutine.upsert({
        where: { name: 'Push Day' },
        update: {},
        create: {
            name: 'Push Day',
            description: 'Chest, shoulders, and triceps focused workout',
        },
    })
    const pushExercises = [
        'Incline Pushups',
        'Diamond Pushups',
        'Pike Pushups',
        'Dips',
        'Plank',
    ]
    for (let i = 0; i < pushExercises.length; i++) {
        const exercise = createdExercises.find(e => e.name === pushExercises[i])
        if (exercise) {
            await prisma.routineExercise.create({
                data: {
                    order: i + 1,
                    routineId: pushRoutine.id,
                    exerciseId: exercise.id,
                },
            })
        }
    }
    // Pull Day
    const pullRoutine = await prisma.workoutRoutine.upsert({
        where: { name: 'Pull Day' },
        update: {},
        create: {
            name: 'Pull Day',
            description: 'Back and biceps focused workout',
        },
    })
    const pullExercises = [
        'Pull-ups',
        'Negative Pull-ups',
        'Australian Rows',
        'Dead Hangs',
        'Hollow Body Rocks',
    ]
    for (let i = 0; i < pullExercises.length; i++) {
        const exercise = createdExercises.find(e => e.name === pullExercises[i])
        if (exercise) {
            await prisma.routineExercise.create({
                data: {
                    order: i + 1,
                    routineId: pullRoutine.id,
                    exerciseId: exercise.id,
                },
            })
        }
    }
    // Home Reboot (Full Body)
    const homeRebootRoutine = await prisma.workoutRoutine.upsert({
        where: { name: 'Home Reboot' },
        update: {},
        create: {
            name: 'Home Reboot',
            description: 'Full body workout for home training',
        },
    })
    const homeRebootExercises = [
        'Incline Pushups',
        'Bodyweight Squats',
        'Australian Rows',
        'Plank',
        'Dead Hangs',
    ]
    for (let i = 0; i < homeRebootExercises.length; i++) {
        const exercise = createdExercises.find(e => e.name === homeRebootExercises[i])
        if (exercise) {
            await prisma.routineExercise.create({
                data: {
                    order: i + 1,
                    routineId: homeRebootRoutine.id,
                    exerciseId: exercise.id,
                },
            })
        }
    }
    console.log('✅ Seed data created successfully!')
    console.log(`
  Summary:
  - ${warmupItems.length} warmup checklist items
  - ${inventoryItems.length} inventory food items
  - ${exercises.length} exercises (with pain swap logic)
  - 3 workout routines (Push Day, Pull Day, Home Reboot)
  `)
}
main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })