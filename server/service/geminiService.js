const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use environment variable or fallback to your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyA53i0xxQSN37ilKIiVqrIIsWuobD_tomQ');

class GeminiService {
  constructor() {
    // ✅ FIXED: Correct model name - "gemini-pro" not "gemin-pro"
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-pro', // CORRECT SPELLING
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
  }

  async generatePersonalizedFitnessPlan(userData) {
    try {
      console.log('🤖 Generating AI fitness plan for:', userData.name);
      
      const prompt = `
        Create a COMPREHENSIVE personalized fitness plan for a user with the following profile:
        
        USER PROFILE:
        - Name: ${userData.name}
        - Age: ${userData.age || 'Not specified'}
        - Gender: ${userData.gender || 'Not specified'}
        - Height: ${userData.height || 'Not specified'} cm
        - Weight: ${userData.weight || 'Not specified'} kg
        - Fitness Level: ${userData.fitnessLevel || 'beginner'}
        - Goals: ${userData.goals || 'General fitness'}
        - Activity Level: ${userData.activityLevel || 'moderate'}
        
        Please provide a JSON response with the following structure:
        {
          "dailyCalories": number,
          "proteinGoal": number,
          "carbsGoal": number,
          "fatGoal": number,
          "waterGoal": number,
          "stepGoal": number,
          "workoutGoal": number,
          "weeklySchedule": [
            {
              "day": "Monday",
              "workoutType": "string",
              "duration": number,
              "caloriesBurned": number,
              "exercises": ["string"]
            }
          ],
          "recommendations": ["string"],
          "fitnessTips": ["string"]
        }
        
        Make it realistic and personalized based on the user's data.
        Return ONLY valid JSON, no additional text.
      `;

      console.log('📤 Sending request to Gemini AI...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📥 Received AI response:', text.substring(0, 200) + '...');
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const fitnessPlan = JSON.parse(jsonMatch[0]);
        console.log('✅ AI fitness plan generated successfully');
        return fitnessPlan;
      } else {
        console.log('❌ No JSON found in AI response, using default plan');
        throw new Error('Invalid response format from Gemini');
      }
    } catch (error) {
      console.error('🤖 Gemini API Error:', error.message);
      console.log('🔄 Using default fitness plan due to AI error');
      // Return default values if API fails
      return this.getDefaultFitnessPlan(userData);
    }
  }

  async generateDailyWorkout(userData, dayOfWeek) {
    try {
      const prompt = `
        Generate a personalized workout for ${dayOfWeek} for a user with:
        - Fitness Level: ${userData.fitnessLevel}
        - Goals: ${userData.goals}
        - Available time: 45 minutes
        
        Return JSON: {
          "workoutName": "string",
          "duration": number,
          "exercises": [
            {
              "name": "string",
              "sets": number,
              "reps": string,
              "rest": string
            }
          ],
          "estimatedCalories": number
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : this.getDefaultWorkout();
    } catch (error) {
      console.error('Gemini Workout Error:', error);
      return this.getDefaultWorkout();
    }
  }

  getDefaultFitnessPlan(userData) {
    console.log('🔄 Generating default fitness plan...');
    
    // Calculate BMR and TDEE for basic calorie estimation
    const weight = userData.weight || 70;
    const height = userData.height || 170;
    const age = userData.age || 30;
    const gender = userData.gender || 'male';
    
    // Basic BMR calculation (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    const activityLevel = userData.activityLevel || 'moderate';
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    const defaultPlan = {
      dailyCalories: Math.round(tdee),
      proteinGoal: Math.round(weight * 1.8),
      carbsGoal: Math.round((tdee * 0.5) / 4),
      fatGoal: Math.round((tdee * 0.25) / 9),
      waterGoal: Math.round(weight * 0.033 * 1000), // Based on body weight
      stepGoal: 10000,
      workoutGoal: 16,
      weeklySchedule: this.getDefaultWeeklySchedule(),
      recommendations: [
        "Stay consistent with your workout routine",
        "Drink plenty of water throughout the day",
        "Get 7-9 hours of sleep nightly",
        "Focus on proper form over heavy weights",
        "Include both cardio and strength training"
      ],
      fitnessTips: [
        "Warm up before each workout and cool down after",
        "Listen to your body and rest when needed",
        "Track your progress to stay motivated",
        "Stay hydrated, especially during workouts",
        "Be patient - fitness results take time"
      ]
    };

    console.log('✅ Default fitness plan created');
    return defaultPlan;
  }

  getDefaultWeeklySchedule() {
    return [
      { 
        day: "Monday", 
        workoutType: "Upper Body Strength", 
        duration: 45, 
        caloriesBurned: 280, 
        exercises: ["Push-ups", "Dumbbell Rows", "Shoulder Press", "Bicep Curls"] 
      },
      { 
        day: "Tuesday", 
        workoutType: "Cardio & Core", 
        duration: 30, 
        caloriesBurned: 250, 
        exercises: ["Jumping Jacks", "Plank", "Mountain Climbers", "Russian Twists"] 
      },
      { 
        day: "Wednesday", 
        workoutType: "Active Recovery", 
        duration: 20, 
        caloriesBurned: 120, 
        exercises: ["Yoga Flow", "Dynamic Stretching", "Foam Rolling"] 
      },
      { 
        day: "Thursday", 
        workoutType: "Lower Body Strength", 
        duration: 50, 
        caloriesBurned: 320, 
        exercises: ["Squats", "Lunges", "Glute Bridges", "Calf Raises"] 
      },
      { 
        day: "Friday", 
        workoutType: "HIIT Circuit", 
        duration: 25, 
        caloriesBurned: 300, 
        exercises: ["Burpees", "High Knees", "Plank Jacks", "Butt Kicks"] 
      },
      { 
        day: "Saturday", 
        workoutType: "Cardio Endurance", 
        duration: 40, 
        caloriesBurned: 320, 
        exercises: ["Jogging", "Jump Rope", "Step Ups"] 
      },
      { 
        day: "Sunday", 
        workoutType: "Rest Day", 
        duration: 0, 
        caloriesBurned: 0, 
        exercises: ["Rest and Recovery"] 
      }
    ];
  }

  getDefaultWorkout() {
    return {
      workoutName: "Full Body Strength",
      duration: 45,
      exercises: [
        { name: "Bodyweight Squats", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Push-ups", sets: 3, reps: "10-12", rest: "45s" },
        { name: "Bent-over Rows", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Plank", sets: 3, reps: "30-45s", rest: "30s" }
      ],
      estimatedCalories: 280
    };
  }
}

module.exports = new GeminiService();