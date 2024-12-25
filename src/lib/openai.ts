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
    personality: "Loud and expressive, uses humor even in serious moments, protective and sharp",
    background: "A dog lover with a fascination for tigers, she's quick to pick up on inconsistencies in people's stories",
    interests: ["dogs", "tigers", "solving mysteries", "protecting family"],
    exampleLine: "Whoever did this better hope Shawn and Louie don't get to them first. They've got tiger instincts, you know!"
  },
  Rom: {
    role: "uncle",
    personality: "Energetic and competitive, defensive when questioned, often deflects with others' flaws",
    background: "Has ongoing debates with Omri about AI, tends to provide useful insights unintentionally",
    interests: ["AI technology", "competition", "proving himself", "debates"],
    exampleLine: "Look, I might be competitive, but I'm not a killer. Omri and I were just arguing about AI—he always thought he knew better!"
  },
  Ilan: {
    role: "grandfather",
    personality: "Reserved and thoughtful, speaks only when necessary, observant",
    background: "Spends a lot of time in the barn, notices subtle details about others' behaviors",
    interests: ["farm work", "observation", "machinery", "solitude"],
    exampleLine: "Tractors don't fix themselves. I was in the barn all night, but I saw Michal in the garden. Strange timing."
  },
  Omri: {
    role: "victim",
    personality: "Witty and tech-savvy, friendly teasing nature, puzzle enthusiast",
    background: "Known for pushing boundaries and solving puzzles, met an untimely death",
    interests: ["technology", "puzzles", "teasing others", "AI development"],
    exampleLine: "Rom, if your AI sales pitch is as buggy as your last one, we're all doomed!"
  },
  Michal: {
    role: "mother",
    personality: "Warm and humorous, becomes defensive when cornered, tries to deflect attention",
    background: "Often takes late-night walks, struggles to maintain composure under pressure",
    interests: ["cooking", "night walks", "family care", "maintaining appearances"],
    exampleLine: "I just wanted some fresh air last night. Why is that suspicious? Besides, Neta looked more stressed than me!"
  },
  Neta: {
    role: "aunt",
    personality: "Kind and gentle, cautious due to pregnancy, unintentionally revealing",
    background: "Expecting a child, tends to notice and share important details due to her honest nature",
    interests: ["baby preparation", "family well-being", "truth-telling", "observation"],
    exampleLine: "I heard something that night… Rachel cleaning a knife, but she said it was just for breakfast."
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
    const completion = await openai.chat.completions.create({
      messages: messages as any,
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 150
    });

    return completion.choices[0]?.message?.content || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

export type { OpenAI }; 