const exercises = [
    {
        name: "Push-ups",
        description: "A classic bodyweight exercise that targets the chest, shoulders, and triceps.",
        category: "Strength",
        difficulty: "Beginner",
        sets: 3,
        reps: "10-15",
        duration: null,
        rest: 60,
        calories: 8,
        targets: ["chest", "shoulders", "triceps"],
        equipment: ["bodyweight"],
        instructions: [
            "Start in a plank position with hands shoulder-width apart",
            "Keep your body straight from head to heels",
            "Lower your body until your chest nearly touches the floor",
            "Push back up to the starting position",
            "Keep your core tight throughout the movement"
        ],
        videoUrl: "https://www.youtube.com/embed/IODxDxX7oi4",
        imageUrl: "/assets/exercises/pushups.jpg"
    },
    {
        name: "Bodyweight Squats",
        description: "Fundamental lower body exercise that builds leg strength and improves mobility.",
        category: "Strength",
        difficulty: "Beginner",
        sets: 4,
        reps: "15-20",
        duration: null,
        rest: 60,
        calories: 6,
        targets: ["quadriceps", "glutes", "hamstrings"],
        equipment: ["bodyweight"],
        instructions: [
            "Stand with feet shoulder-width apart",
            "Keep your chest up and back straight",
            "Lower your hips as if sitting in a chair",
            "Go as low as you can while keeping heels on the ground",
            "Push through heels to return to standing position"
        ],
        videoUrl: "https://www.youtube.com/embed/aclHkVaku9U",
        imageUrl: "/assets/exercises/squats.jpg"
    },
    {
        name: "Plank",
        description: "Excellent core exercise that strengthens your entire midsection.",
        category: "Core",
        difficulty: "Beginner",
        sets: 3,
        reps: "30-60 seconds",
        duration: 60,
        rest: 30,
        calories: 3,
        targets: ["core", "shoulders", "back"],
        equipment: ["bodyweight"],
        instructions: [
            "Start in a push-up position but rest on your forearms",
            "Keep your body in a straight line from head to heels",
            "Engage your core and glutes",
            "Hold the position without letting hips sag or rise",
            "Breathe steadily throughout the exercise"
        ],
        videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
        imageUrl: "/assets/exercises/plank.jpg"
    },
    {
        name: "Jumping Jacks",
        description: "Full-body cardiovascular exercise that improves coordination and endurance.",
        category: "Cardio",
        difficulty: "Beginner",
        sets: 4,
        reps: "30 seconds",
        duration: 30,
        rest: 30,
        calories: 10,
        targets: ["full body", "cardiovascular"],
        equipment: ["bodyweight"],
        instructions: [
            "Stand with feet together and arms at your sides",
            "Jump while spreading legs and raising arms overhead",
            "Jump back to starting position",
            "Maintain a steady rhythm",
            "Land softly to protect your joints"
        ],
        videoUrl: "https://www.youtube.com/embed/iSSAk4XCsRA",
        imageUrl: "/assets/exercises/jumping-jacks.jpg"
    },
    {
        name: "Lunges",
        description: "Unilateral leg exercise that improves balance and leg strength.",
        category: "Strength",
        difficulty: "Beginner",
        sets: 3,
        reps: "10-12 per leg",
        duration: null,
        rest: 45,
        calories: 7,
        targets: ["quadriceps", "glutes", "hamstrings"],
        equipment: ["bodyweight"],
        instructions: [
            "Stand with feet hip-width apart",
            "Step forward with one leg and lower your hips",
            "Both knees should be bent at 90-degree angles",
            "Keep your front knee above your ankle",
            "Push back to starting position and alternate legs"
        ],
        videoUrl: "https://www.youtube.com/embed/QOVaHwm-Q6U",
        imageUrl: "/assets/exercises/lunges.jpg"
    },
    {
        name: "Burpees",
        description: "High-intensity full-body exercise that combines strength and cardio.",
        category: "HIIT",
        difficulty: "Intermediate",
        sets: 4,
        reps: "30 seconds",
        duration: 30,
        rest: 30,
        calories: 15,
        targets: ["full body", "cardiovascular"],
        equipment: ["bodyweight"],
        instructions: [
            "Start in standing position",
            "Drop into a squat position with hands on the floor",
            "Kick feet back into a plank position",
            "Do a push-up (optional for beginners)",
            "Jump feet back to squat position and explode upward"
        ],
        videoUrl: "https://www.youtube.com/embed/dZgVxmf6jkA",
        imageUrl: "/assets/exercises/burpees.jpg"
    },
    {
        name: "Mountain Climbers",
        description: "Dynamic core exercise that also provides cardiovascular benefits.",
        category: "Core",
        difficulty: "Beginner",
        sets: 3,
        reps: "20 seconds",
        duration: 20,
        rest: 30,
        calories: 8,
        targets: ["core", "shoulders", "cardiovascular"],
        equipment: ["bodyweight"],
        instructions: [
            "Start in a plank position",
            "Bring one knee toward your chest",
            "Quickly switch legs in a running motion",
            "Keep your hips stable and core engaged",
            "Maintain a steady pace throughout"
        ],
        videoUrl: "https://www.youtube.com/embed/cnyTQDSE884",
        imageUrl: "/assets/exercises/mountain-climbers.jpg"
    },
    {
        name: "Bicep Curls",
        description: "Isolation exercise that targets the bicep muscles in your arms.",
        category: "Strength",
        difficulty: "Beginner",
        sets: 3,
        reps: "12-15",
        duration: null,
        rest: 45,
        calories: 5,
        targets: ["biceps"],
        equipment: ["dumbbells"],
        instructions: [
            "Stand holding dumbbells with palms facing forward",
            "Keep elbows close to your torso",
            "Curl the weights while contracting your biceps",
            "Lower the weights slowly back to starting position",
            "Avoid swinging your body during the movement"
        ],
        videoUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
        imageUrl: "/assets/exercises/bicep-curls.jpg"
    }
];

module.exports = exercises;