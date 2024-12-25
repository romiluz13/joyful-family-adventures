import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true, // Note: In production, you should use a backend
});

// Character personalities and backgrounds
const characterProfiles = {
  Rachel: {
    role: "grandmother",
    personality: "warm, loving, excellent cook",
    background: "Has been cooking family recipes for decades, loves sharing stories about food and family traditions",
    interests: ["cooking", "family history", "gardening", "traditional recipes"]
  },
  Rom: {
    role: "uncle",
    personality: "practical, helpful, good with tools",
    background: "Known for being able to fix anything around the house, always ready to help with projects",
    interests: ["DIY projects", "technology", "problem-solving", "teaching skills"]
  },
  Ilan: {
    role: "grandfather",
    personality: "wise, storyteller, family historian",
    background: "Has lived through many interesting times, loves sharing wisdom through stories",
    interests: ["family history", "life lessons", "historical events", "sharing wisdom"]
  },
  Omri: {
    role: "father",
    personality: "caring, adventurous, playful",
    background: "A devoted father who loves outdoor activities and creating fun family memories",
    interests: ["sports", "family games", "outdoor adventures", "teaching life skills"]
  },
  Michal: {
    role: "mother",
    personality: "nurturing, creative, organized",
    background: "A loving mother who balances work and family life, always finding creative ways to make everyday moments special",
    interests: ["family activities", "arts and crafts", "education", "family wellness"]
  },
  Neta: {
    role: "aunt",
    personality: "gentle, optimistic, expecting mother",
    background: "Rom's wife, expecting their first child, brings fresh perspective to family discussions",
    interests: ["baby preparation", "healthy living", "family planning", "modern parenting"]
  }
};

export async function getCharacterResponse(
  character: keyof typeof characterProfiles,
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
) {
  const profile = characterProfiles[character];
  
  const messages = [
    {
      role: "system",
      content: `You are ${character}, a ${profile.role} in a family game. You are ${profile.personality}. 
      Your background: ${profile.background}
      You should stay in character and respond as ${character} would, drawing from your interests: ${profile.interests.join(", ")}.
      Keep responses concise, friendly, and appropriate for family interaction.`
    },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: "user", content: userMessage }
  ];

  try {
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        messages,
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 150
      })
    }).then(res => res.json());

    return completion.choices[0]?.message?.content || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

export type { OpenAI }; 