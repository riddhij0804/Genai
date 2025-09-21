import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import process from 'process';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from React build
app.use(express.static(path.join(__dirname, "dist")));

// Make sure API routes work, and all other routes return index.html
app.get("*", (req, res, next) => {
  const apiRoutes = ["/generate", "/recommend", "/analyze-profile", "/action-plan"];
  if (apiRoutes.some(route => req.path.startsWith(route))) return next();
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Existing /generate endpoint
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ text: response.data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

// New /recommend endpoint for multi-domain career mapping
// /recommend endpoint
app.post("/recommend", async (req, res) => {
  const { skills } = req.body;

  if (!skills || skills.length === 0) {
    return res.status(400).json({ error: "No skills provided" });
  }

  try {
    const prompt = `Based on these skills: ${skills.join(", ")}, suggest 5 exciting career paths. 
    For each career, provide:
    1. Career Title
    2. A catchy 2-3 sentence description that highlights the exciting aspects, impact, and opportunities
    
    Format each career as:
    *Career Title*: Description here
    
    Make the descriptions engaging and inspiring to motivate users to explore these careers further.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Parse the response to extract career titles and descriptions
    const responseText = response.data.candidates[0].content.parts[0].text;
    const careers = responseText
      .split('\n')
      .filter(line => line.includes('') && line.includes(':'))
      .map(line => {
        // Extract title and description from format: *Title*: Description
        const match = line.match(/\\(.?)\\:\s(.*)/);
        if (match) {
          return {
            title: match[1].trim(),
            description: match[2].trim()
          };
        }
        return null;
      })
      .filter(Boolean);

    res.json({ careers });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate career recommendations" });
  }
});


// New /analyze-profile endpoint for comprehensive career analysis
app.post("/analyze-profile", async (req, res) => {
  const { profileData } = req.body;

  if (!profileData) {
    return res.status(400).json({ error: "No profile data provided" });
  }

  try {
    // Create comprehensive prompt based on EXACTLY what user entered
    const prompt = `
    You are an expert career counselor. Analyze this user's COMPLETE profile and recommend 5 personalized career paths based on EXACTLY what they have entered. Do not add anything they haven't mentioned.

    USER PROFILE ANALYSIS:
    Name: ${profileData.fullName}
    Age: ${profileData.age}
    Stage: ${profileData.stage}
    Location: ${profileData.city || 'Not specified'}

    EDUCATION DETAILS:
    ${profileData.stage === 'School' ? `
    - Current Grade: ${profileData.currentGrade}th Grade
    - Favorite Subjects: ${profileData.favoriteSubjects?.join(', ') || 'Not specified'}
    - Streams Interested: ${profileData.streamsInterested?.join(', ') || 'Not specified'}
    - Academic Strengths: ${profileData.academicStrengths?.join(', ') || 'Not specified'}
    - Clubs/Extracurriculars: ${profileData.clubsExtracurriculars?.join(', ') || 'Not specified'}
    ` : ''}
    ${profileData.stage === 'College' ? `
    - Degree & Branch: ${profileData.degreeAndBranch || 'Not specified'}
    - Year of Study: ${profileData.yearOfStudy || 'Not specified'}
    - Current Skills: ${profileData.currentSkills?.join(', ') || 'Not specified'}
    - Certifications/Courses: ${profileData.certificationsOnlineCourses || 'Not specified'}
    - Internships/Projects: ${profileData.internshipsProjects || 'Not specified'}
    ` : ''}
    ${profileData.stage === 'Professional' ? `
    - Current Job Role: ${profileData.currentJobRole || 'Not specified'}
    - Industry: ${profileData.industry || 'Not specified'}
    - Years Experience: ${profileData.yearsExperience || 'Not specified'}
    - Core Skills: ${profileData.coreSkills?.join(', ') || 'Not specified'}
    - Professional Certifications: ${profileData.professionalCertifications || 'Not specified'}
    - Job Satisfaction: ${profileData.jobSatisfaction || 'Not specified'}
    ` : ''}

    INTERESTS & STRENGTHS:
    ${profileData.stage === 'School' ? `
    - Personal Interests: ${profileData.personalInterests?.join(', ') || 'Not specified'}
    - Strengths/Talents: ${profileData.strengthsTalents?.join(', ') || 'Not specified'}
    ` : ''}
    ${profileData.stage === 'College' ? `
    - Interests: ${profileData.collegeInterests?.join(', ') || 'Not specified'}
    - Soft Skills/Strengths: ${profileData.softSkillsStrengths?.join(', ') || 'Not specified'}
    - Preferred Work Style: ${profileData.preferredWorkStyle || 'Not specified'}
    ` : ''}
    ${profileData.stage === 'Professional' ? `
    - Areas of Growth: ${profileData.areasOfGrowth?.join(', ') || 'Not specified'}
    - Professional Strengths: ${profileData.professionalStrengths?.join(', ') || 'Not specified'}
    - Career Preferences: ${profileData.careerPreferences || 'Not specified'}
    ` : ''}

    CAREER ASPIRATIONS:
    ${profileData.stage === 'School' ? `
    - Dream Careers: ${profileData.dreamCareers?.join(', ') || 'Not specified'}
    - Career Motivation: ${profileData.motivationForCareer || 'Not specified'}
    - Short-term Goal: ${profileData.shortTermGoal || 'Not specified'}
    ` : ''}
    ${profileData.stage === 'College' ? `
    - Target Role: ${profileData.careerGoalTargetRole || 'Not specified'}
    - Desired Industry: ${profileData.desiredIndustry || 'Not specified'}
    - Learning Method: ${profileData.preferredLearningMethod || 'Not specified'}
    ` : ''}
    ${profileData.stage === 'Professional' ? `
    - Career Growth Plan: ${profileData.careerGrowthPlan || 'Not specified'}
    - Target Roles/Industry: ${profileData.targetRolesIndustry || 'Not specified'}
    - Skills to Learn: ${profileData.skillsToLearn?.join(', ') || 'Not specified'}
    - Obstacles Faced: ${profileData.obstaclesFaced || 'Not specified'}
    ` : ''}

    INSTRUCTIONS:
    1. Analyze ONLY what the user has provided - do not add external skills or subjects
    2. Connect their favorite subjects, extracurriculars, interests, and goals to career paths
    3. Map their specific strengths and talents to matching careers
    4. Consider their learning style and work preferences
    5. Reference their exact goals and motivations

    For each of the 5 career recommendations, provide:
    - *title*: Clear career name
    - *matchPercentage*: 75-95% based on how well it matches their ACTUAL profile
    - *description*: Write a brief but exciting 2-3 sentence description that:
      * Starts with a catchy hook about what makes this career amazing
      * Explains HOW their specific interests/subjects connect to this career
      * Ends with an exciting outcome or impact they can achieve
      * Use energetic language that creates enthusiasm and curiosity
    - *relevantSkillsFromProfile*: List 3-4 items from THEIR ACTUAL profile (subjects, extracurriculars, strengths, interests) that connect to this career
    - *growthPotential*: Start with exactly one of these words: "High Growth", "Moderate Growth", or "Low Growth" followed by specific explanation of career progression opportunities, specialization areas, and advancement paths (NO salary mentions)
      * High Growth: Fast advancement, many opportunities, high demand
      * Moderate Growth: Steady progression, some advancement opportunities  
      * Low Growth: Stable but slower advancement, fewer rapid changes

    Return ONLY a valid JSON array with exactly 5 career objects. Example format:
    [
      {
        "title": "Data Scientist",
        "matchPercentage": 88,
        "description": "Turn numbers into magic! Your love for Math and analytical thinking will help you discover hidden patterns that solve real-world problems - from predicting the next viral trend to helping doctors save lives. Imagine transforming raw data into insights that change the world!",
        "relevantSkillsFromProfile": ["Math", "Problem-Solving", "Technology Interest", "Analytical Thinking"],
        "growthPotential": "High Growth - Rapid advancement from Junior to Senior roles, opportunities to specialize in AI/ML, lead data teams, or become Chief Data Officer. High demand across all industries."
      }
    ]
    `;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseText = response.data.candidates[0].content.parts[0].text;
    
    // Clean and parse JSON response - remove markdown code blocks
    let cleanedResponse = responseText.trim();
    
    // Remove all variations of markdown code blocks
    cleanedResponse = cleanedResponse.replace(/^```json\s*/i, ''); // Remove ```json at start (case insensitive)
    cleanedResponse = cleanedResponse.replace(/^```\s*/, ''); // Remove ``` at start
    cleanedResponse = cleanedResponse.replace(/\s*```$/g, ''); // Remove ``` at end
    cleanedResponse = cleanedResponse.replace(/```.*$/gm, ''); // Remove any remaining ``` lines
    
    // Remove any non-JSON text before the first [ or {
    const jsonStart = cleanedResponse.search(/[\[\{]/);
    if (jsonStart > 0) {
      cleanedResponse = cleanedResponse.substring(jsonStart);
    }
    
    // Remove any non-JSON text after the last ] or }
    const jsonEnd = Math.max(cleanedResponse.lastIndexOf(']'), cleanedResponse.lastIndexOf('}'));
    if (jsonEnd > 0 && jsonEnd < cleanedResponse.length - 1) {
      cleanedResponse = cleanedResponse.substring(0, jsonEnd + 1);
    }
    
    console.log('Original response:', responseText.substring(0, 100) + '...');
    console.log('Cleaned response:', cleanedResponse.substring(0, 200) + '...');
    
    try {
      const careers = JSON.parse(cleanedResponse);
      res.json({ careers });
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response text:', responseText);
      // Enhanced fallback with user's actual data
      const fallbackCareers = [{
        title: "Career Path Based on Your Profile",
        matchPercentage: 85,
        description: `🚀 Transform your passion into impact! Your interests in ${profileData.favoriteSubjects?.join(', ') || 'your chosen subjects'} combined with your strengths in ${profileData.strengthsTalents?.join(', ') || profileData.academicStrengths?.join(', ') || 'your areas'} create the perfect recipe for success. You'll solve exciting challenges while making a real difference in the world!`,
        relevantSkillsFromProfile: profileData.favoriteSubjects?.slice(0, 4) || ["Your Subjects", "Your Interests", "Your Strengths", "Your Goals"],
        growthPotential: "High Growth - Excellent advancement opportunities with multiple specialization paths, leadership roles, and industry recognition potential"
      }];
      res.json({ 
        careers: fallbackCareers,
        note: "Simplified response due to parsing issue"
      });
    }

  } catch (error) {
    console.error('Profile Analysis Error:', error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze profile and generate recommendations" });
  }
});

// Import action plan generator
import { generateActionPlan } from './src/actionPlanGenerator.js';

// Action Plan Generation Endpoint
app.post('/action-plan', async (req, res) => {
  const { careers, skills } = req.body;
  
  if (!careers || !Array.isArray(careers) || careers.length === 0) {
    return res.status(400).json({ error: "Please provide at least one career" });
  }
  
  try {
    console.log(`Generating action plan for careers: ${careers.join(", ")}`);
    const actionPlan = await generateActionPlan(careers, skills || []);
    
    // Add detailed logging of response structure
    console.log('Action Plan Response Structure:', JSON.stringify({
      keys: Object.keys(actionPlan || {}),
      hasRoadmap: Boolean(actionPlan?.roadmap_json),
      hasReverseMapping: Boolean(actionPlan?.reverse_job_mapping),
      hasSituationSpecific: Boolean(actionPlan?.situation_specific),
      hasAdditionalSkills: Boolean(actionPlan?.additional_skills_needed),
      isError: Boolean(actionPlan?.error),
      isFallback: Boolean(actionPlan?.note?.includes("simplified action plan"))
    }, null, 2));
    
    // Add more detailed debugging of actual content
    console.log('Reverse Job Mapping Structure:', JSON.stringify({
      hasSkills: Boolean(actionPlan?.reverse_job_mapping?.skills),
      skillsCount: Array.isArray(actionPlan?.reverse_job_mapping?.skills) ? actionPlan.reverse_job_mapping.skills.length : 0,
      hasCourses: Boolean(actionPlan?.reverse_job_mapping?.courses),
      coursesCount: Array.isArray(actionPlan?.reverse_job_mapping?.courses) ? actionPlan.reverse_job_mapping.courses.length : 0,
      hasTools: Boolean(actionPlan?.reverse_job_mapping?.tools),
      toolsCount: Array.isArray(actionPlan?.reverse_job_mapping?.tools) ? actionPlan.reverse_job_mapping.tools.length : 0
    }, null, 2));
    
    console.log('Situation Specific Structure:', JSON.stringify({
      hasFreelancing: Boolean(actionPlan?.situation_specific?.freelancing),
      hasTopRecruiters: Boolean(actionPlan?.situation_specific?.top_recruiters),
      recruitersCount: Array.isArray(actionPlan?.situation_specific?.top_recruiters) ? actionPlan.situation_specific.top_recruiters.length : 0,
      hasGovInitiatives: Boolean(actionPlan?.situation_specific?.government_initiatives),
      hasEmergingTrends: Boolean(actionPlan?.situation_specific?.emerging_trends),
      trendsCount: Array.isArray(actionPlan?.situation_specific?.emerging_trends) ? actionPlan.situation_specific.emerging_trends.length : 0
    }, null, 2));
    
    if (actionPlan.error) {
      console.error('Action Plan Error:', actionPlan.error);
      
      // Check for API quota errors and provide a better user message
      if (actionPlan.error.includes("quota") || actionPlan.error.includes("429")) {
        return res.status(429).json({ 
          error: "API rate limit reached. Using simplified career plan instead.",
          limitExceeded: true
        });
      }
      
      return res.status(500).json({ error: actionPlan.error });
    }
    
    // Check if this is a fallback response
    if (actionPlan.note && actionPlan.note.includes("simplified action plan due to AI service limitations")) {
      res.json({
        ...actionPlan,
        limitExceeded: true
      });
    } else {
      // Ensure all expected sections are present, even if empty
      const safeActionPlan = {
        roadmap_json: actionPlan.roadmap_json || [],
        reverse_job_mapping: actionPlan.reverse_job_mapping || {
          skills: [],
          courses: [],
          tools: []
        },
        situation_specific: actionPlan.situation_specific || {
          freelancing: "Information not available",
          top_recruiters: [],
          government_initiatives: [],
          emerging_trends: []
        },
        additional_skills_needed: actionPlan.additional_skills_needed || []
      };
      
      res.json(safeActionPlan);
    }
  } catch (error) {
    console.error('Action Plan Generation Error:', error);
    res.status(500).json({ error: "Failed to generate action plan" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));