import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

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
    **Career Title**: Description here
    
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
      .filter(line => line.includes('**') && line.includes(':'))
      .map(line => {
        // Extract title and description from format: **Title**: Description
        const match = line.match(/\*\*(.*?)\*\*:\s*(.*)/);
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


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
