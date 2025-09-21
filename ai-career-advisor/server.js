import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";
import { generateActionPlan } from './src/actionPlanGenerator.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from React build
app.use(express.static(path.join(__dirname, "dist")));

// Serve React index.html for all routes except API
app.get(/^(?!\/(generate|recommend|analyze-profile|action-plan)).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ------------------------
// /generate endpoint
// ------------------------
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ text });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

// ------------------------
// /recommend endpoint
// ------------------------
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
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse careers
    const careers = responseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes(':') && line.startsWith('*'))
      .map(line => {
        const match = line.match(/\*(.*?)\*:\s(.+)/);
        if (match) {
          return {
            title: match[1].trim(),
            description: match[2].trim()
          };
        }
        return null;
      })
      .filter(Boolean);

    // Fallback if parsing fails
    if (!careers.length) {
      return res.json({
        careers: skills.map((skill, idx) => ({
          title: `Career related to ${skill}`,
          description: `Explore exciting opportunities in ${skill} related fields.`,
        })),
        note: "Fallback used due to parsing issue"
      });
    }

    res.json({ careers });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate career recommendations" });
  }
});

// ------------------------
// /analyze-profile endpoint
// ------------------------
app.post("/analyze-profile", async (req, res) => {
  const { profileData } = req.body;
  if (!profileData) return res.status(400).json({ error: "No profile data provided" });

  try {
    const prompt = `You are an expert career counselor. Analyze this user's COMPLETE profile and recommend 5 personalized career paths based on EXACTLY what they have entered. Do not add anything they haven't mentioned.

USER PROFILE ANALYSIS:
${JSON.stringify(profileData)}

For each of the 5 career recommendations, provide:
- *title*: Clear career name
- *matchPercentage*: 75-95%
- *description*: 2-3 sentence engaging description
- *relevantSkillsFromProfile*: 3-4 items from user's actual profile
- *growthPotential*: High Growth / Moderate Growth / Low Growth

Return ONLY a valid JSON array with exactly 5 career objects.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    let responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean JSON
    responseText = responseText.replace(/```json|```/gi, '').trim();
    const jsonStart = responseText.search(/[\[\{]/);
    const jsonEnd = Math.max(responseText.lastIndexOf(']'), responseText.lastIndexOf('}'));
    if (jsonStart >= 0 && jsonEnd >= 0) {
      responseText = responseText.substring(jsonStart, jsonEnd + 1);
    }

    let careers;
    try {
      careers = JSON.parse(responseText);
    } catch {
      // Fallback
      careers = [{
        title: "Career Path Based on Your Profile",
        matchPercentage: 85,
        description: `🚀 Transform your passion into impact! Your profile aligns with exciting opportunities.`,
        relevantSkillsFromProfile: profileData.favoriteSubjects?.slice(0, 4) || ["Your Subjects", "Your Interests", "Your Strengths", "Your Goals"],
        growthPotential: "High Growth - Excellent advancement opportunities with multiple specialization paths."
      }];
    }

    res.json({ careers });
  } catch (error) {
    console.error('Profile Analysis Error:', error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze profile and generate recommendations" });
  }
});

// ------------------------
// /action-plan endpoint
// ------------------------
app.post('/action-plan', async (req, res) => {
  const { careers, skills } = req.body;
  if (!careers || !Array.isArray(careers) || careers.length === 0) {
    return res.status(400).json({ error: "Please provide at least one career" });
  }

  try {
    const actionPlan = await generateActionPlan(careers, skills || []);

    // Ensure all expected sections are present
    const safeActionPlan = {
      roadmap_json: actionPlan.roadmap_json || [],
      reverse_job_mapping: actionPlan.reverse_job_mapping || { skills: [], courses: [], tools: [] },
      situation_specific: actionPlan.situation_specific || { freelancing: "Information not available", top_recruiters: [], government_initiatives: [], emerging_trends: [] },
      additional_skills_needed: actionPlan.additional_skills_needed || []
    };

    if (actionPlan.error) {
      if (actionPlan.error.includes("quota") || actionPlan.error.includes("429")) {
        return res.status(429).json({ error: "API rate limit reached. Using simplified career plan instead.", limitExceeded: true });
      }
      return res.status(500).json({ error: actionPlan.error });
    }

    res.json(safeActionPlan);
  } catch (error) {
    console.error('Action Plan Generation Error:', error);
    res.status(500).json({ error: "Failed to generate action plan" });
  }
});

// ------------------------
// Start server
// ------------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
