import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';


dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

 /**
 * @param {Array<string>} careers - List of careers
 * @param {Array<string>} skills - List of skills
 * @returns {Object}
 */
function generateFallbackResponse(careers, skills) {
  const career = careers[0] || "Selected career";
  
  return {
    roadmap_json: [
      {
        id: 1,
        title: "Research and Learn",
        description: `Begin by researching ${career} fundamentals and understanding the field.`,
        dependencies: []
      },
      {
        id: 2,
        title: "Acquire Core Skills",
        description: "Learn and practice the essential skills required for this career path.",
        dependencies: [1]
      },
      {
        id: 3,
        title: "Build Portfolio",
        description: "Create projects and compile a portfolio showcasing your abilities.",
        dependencies: [2]
      },
      {
        id: 4,
        title: "Network and Connect",
        description: "Build professional connections in your field through events and online platforms.",
        dependencies: [1]
      },
      {
        id: 5,
        title: "Apply for Opportunities",
        description: "Start applying for internships, entry-level positions, or freelance work.",
        dependencies: [2, 3, 4]
      }
    ],
    reverse_job_mapping: {
      skills: skills.length > 0 ? skills : ["Research relevant skills for this career"],
      courses: [
        {
          name: "Fundamentals Course",
          provider: "Online Learning Platforms",
          level: "Beginner"
        },
        {
          name: "Advanced Specialization",
          provider: "Industry Certifications",
          level: "Intermediate"
        }
      ],
      tools: ["Research industry-standard tools for this career"]
    },
    situation_specific: {
      freelancing: "Research freelance opportunities in this field.",
      top_recruiters: ["Research companies hiring for this role"],
      government_initiatives: ["Research relevant government programs"],
      emerging_trends: ["Stay updated on industry publications and news"]
    },
    additional_skills_needed: [
      "Communication skills",
      "Problem-solving abilities",
      "Time management",
      "Industry-specific technical skills"
    ],
    note: "This is a simplified action plan due to AI service limitations. For a more detailed plan, please try again later."
  };
}

/**
 * Generates a structured action plan for career development using Gemini
 * 
 * @param {Array<string>} careers - List of career paths selected by the user
 * @param {Array<string>} skills - List of skills the user currently possesses
 * @returns {Object} A structured JSON object containing the career action plan
 */
export async function generateActionPlan(careers, skills) {
  // Validate input parameters
  if (!careers || !Array.isArray(careers) || careers.length === 0) {
    return { error: "No careers specified" };
  }
  
  if (!skills || !Array.isArray(skills)) {
    skills = []; // Default to empty array if not provided
  }
  
  try {
    // Initialize the Generative AI model
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Use gemini-1.5-flash instead of gemini-1.5-pro as it has more generous quotas
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      // Configure safety settings and other parameters
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });
    
    // Construct the prompt for Gemini with user's careers and skills
    const prompt = `
You are an expert AI career coach and career strategist. 
The user has selected one or more careers and provided their current skills.  

Your task is to generate a **strict JSON output** ONLY. 
The JSON must include the following keys:

1. "roadmap_json" → structured step-by-step roadmap for the selected career(s).  
   - Each step must include:
     - "id" → unique step number
     - "title" → short title of the step
     - "description" → detailed description
     - "dependencies" → array of step ids that must be completed first

2. "reverse_job_mapping" → map the career(s) back to required:
   - Skills
   - Courses / certifications
   - Tools / software

3. "situation_specific" → additional insights such as:
   - Freelancing opportunities
   - Top recruiters
   - Government initiatives
   - Emerging trends in the domain
   
4. "additional_skills_needed" → list of extra skills the user should acquire for this career

⚠️ IMPORTANT:
- Output must be **valid JSON only**. No text outside JSON.  
- Include **facts and sources** wherever applicable.
- Make sure the JSON structure is frontend-ready for visualization with React Flow, Recharts, and other visualization libraries.
- Provide a simplified response if possible to avoid exceeding token limits.

User input:  
- Career(s): ${careers.join(", ")}
- Skills: ${skills.join(", ")}
    `;
    const maxRetries = 3;
    let retries = 0;
    let delay = 1000; 
    
    
    const executeWithRetry = async () => {
      try {
        // Call the Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        
        let cleanedResponse = responseText.replace(/```json\s*|\s*```/g, '').trim();
        
        const jsonStartIndex = cleanedResponse.indexOf('{');
        const jsonEndIndex = cleanedResponse.lastIndexOf('}');
        
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
          cleanedResponse = cleanedResponse.substring(jsonStartIndex, jsonEndIndex + 1);
        }
        
      
        try {
          const actionPlanData = JSON.parse(cleanedResponse);
          return actionPlanData;
        } catch (jsonParseError) {
          console.error("Failed to parse Gemini response as JSON:", jsonParseError);
          console.error("Raw response:", responseText);
          
         
          return { 
            error: "Failed to generate JSON",
            rawResponse: responseText.substring(0, 500) // Include part of the raw response for debugging
          };
        }
      } catch (apiError) {
        if (apiError.message && apiError.message.includes("429") && retries < maxRetries) {    
          let retryDelay = delay;
          try {
            const retryMatch = apiError.message.match(/retry in (\d+\.?\d*)s/i);
            if (retryMatch && retryMatch[1]) {
              retryDelay = Math.ceil(parseFloat(retryMatch[1]) * 1000);
            }
          } catch (e) {
            console.error("Error parsing retry delay:", e);
          }
          
          console.log(`Rate limited. Retrying in ${retryDelay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retries++;
          delay *= 2; 
          return executeWithRetry();
        }
        
        // Check if it's a quota limit error
        if (apiError.message && apiError.message.includes("quota")) {
          console.log("Quota limit reached, providing fallback response");
          
          
          return generateFallbackResponse(careers, skills);
        }
        
        throw apiError;
      }
    };
    
    
    return await executeWithRetry();
    
  } catch (error) {
    console.error("Gemini API error:", error);
    return { 
      error: "API error: " + error.message 
    };
  }
}

export default { generateActionPlan };