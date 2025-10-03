const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyA53i0xxQSN37ilKIiVqrIIsWuobD_tomQ');

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generatePersonalizedFitnessPlan(userData) {
    try {
      const prompt = `
        Create a COMPREHENSIVE personalized fitness plan for a user with the following profile:
        
        USER PROFILE:
        - Name: ${userData.name}
        - Age: ${userData.age || 'Not specified'}
        - Gender: ${userData.gender || 'Not specified'}
        - Height: ${userData.height || 'Not specified'}
        - Weight: ${userData.weight || 'Not specified'}
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
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format from Gemini');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
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
    // Calculate BMR and TDEE for basic calorie estimation
    const weight = userData.weight || 70;
    const height = userData.height || 170;
    const age = userData.age || 30;
    
    // Basic BMR calculation (Mifflin-St Jeor Equation)
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const tdee = bmr * 1.55; // Moderate activity
    
    return {
      dailyCalories: Math.round(tdee),
      proteinGoal: Math.round(weight * 1.8),
      carbsGoal: Math.round((tdee * 0.5) / 4),
      fatGoal: Math.round((tdee * 0.25) / 9),
      waterGoal: Math.round(weight * 0.033 * 1000),
      stepGoal: 10000,
      workoutGoal: 16,
      weeklySchedule: this.getDefaultWeeklySchedule(),
      recommendations: [
        "Stay consistent with your workout routine",
        "Drink plenty of water throughout the day",
        "Get 7-9 hours of sleep nightly"
      ],
      fitnessTips: [
        "Warm up before each workout",
        "Focus on proper form over heavy weights",
        "Listen to your body and rest when needed"
      ]
    };
  }

  getDefaultWeeklySchedule() {
    return [
      { day: "Monday", workoutType: "Strength Training", duration: 45, caloriesBurned: 280, exercises: ["Squats", "Push-ups", "Rows"] },
      { day: "Tuesday", workoutType: "Cardio", duration: 30, caloriesBurned: 250, exercises: ["Running", "Jumping Jacks"] },
      { day: "Wednesday", workoutType: "Active Recovery", duration: 20, caloriesBurned: 120, exercises: ["Yoga", "Stretching"] },
      { day: "Thursday", workoutType: "Strength Training", duration: 45, caloriesBurned: 280, exercises: ["Deadlifts", "Bench Press", "Pull-ups"] },
      { day: "Friday", workoutType: "HIIT", duration: 25, caloriesBurned: 300, exercises: ["Burpees", "Mountain Climbers", "Sprints"] },
      { day: "Saturday", workoutType: "Cardio", duration: 40, caloriesBurned: 320, exercises: ["Cycling", "Swimming"] },
      { day: "Sunday", workoutType: "Rest", duration: 0, caloriesBurned: 0, exercises: ["Rest Day"] }
    ];
  }

  getDefaultWorkout() {
    return {
      workoutName: "Full Body Strength",
      duration: 45,
      exercises: [
        { name: "Squats", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Push-ups", sets: 3, reps: "10-12", rest: "45s" },
        { name: "Bent-over Rows", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Plank", sets: 3, reps: "30-45s", rest: "30s" }
      ],
      estimatedCalories: 280
    };
  }
}

module.exports = new GeminiService();