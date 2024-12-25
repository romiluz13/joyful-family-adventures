import OpenAI from "openai";

if (!import.meta.env.VITE_OPENAI_API_KEY) {
  console.error("OpenAI API key is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

// Game state and clues
export const gameState = {
  victimName: "Omri",
  murderLocation: "garden",
  murderWeapon: "poisoned tea",
  timeOfMurder: "evening family gathering",
  murderer: "Michal",
  motive: "Omri discovered Michal's secret plan to sell the family business",
  victimPersonality: "Witty and tech-savvy, loved teasing others in a friendly way, especially about their tech knowledge"
};

interface CharacterProfile {
  role: string;
  personality: string;
  background: string;
  alibi: string;
  knownClues: string[];
  relationship: string;
  quirks: string[];
  typicalPhrases: string[];
  defenseMechanisms: string;
  isMurderer?: boolean;
}

// Character personalities and backgrounds with murder mystery elements
const characterProfiles: Record<string, CharacterProfile> = {
  Rachel: {
    role: "grandmother",
    personality: "Loud, expressive, and humorous even in serious moments",
    background: "Was in the kitchen preparing dinner, constantly talking about her dogs Shawn and Louie",
    alibi: "Was cooking the entire evening, multiple family members saw her in the kitchen",
    knownClues: [
      "saw Michal preparing tea suspiciously",
      "heard an argument about the family business",
      "noticed Omri was unusually quiet at dinner"
    ],
    relationship: "Victim's mother, deeply affected but uses humor to cope",
    quirks: [
      "Always relates situations to her dogs",
      "Makes tiger references",
      "Laughs nervously when tensions rise"
    ],
    typicalPhrases: [
      "Shawn and Louie would've sniffed out the truth by now!",
      "My tiger instincts are telling me something's not right here...",
      "Oh honey, that's about as believable as my dogs turning vegetarian!"
    ],
    defenseMechanisms: "Deflects tension with humor and dog stories"
  },
  Rom: {
    role: "uncle",
    personality: "Energetic, competitive, and somewhat defensive about his AI business",
    background: "Was fixing the garden shed, trying to prove he's as handy as Omri",
    alibi: "Working on the shed alone, but has tools as evidence",
    knownClues: [
      "noticed disturbed garden area",
      "heard footsteps and rustling",
      "remembers argument with Omri about AI investments"
    ],
    relationship: "Victim's brother, competitive but loving relationship",
    quirks: [
      "Always brings up his AI business",
      "Competes with others' stories",
      "Gets defensive about his tech knowledge"
    ],
    typicalPhrases: [
      "My AI could solve this case faster than any of us!",
      "Omri never understood the potential of my projects...",
      "I might be competitive, but I'm not THAT competitive!"
    ],
    defenseMechanisms: "Points out others' flaws when feeling threatened"
  },
  Ilan: {
    role: "grandfather",
    personality: "Reserved, practical, and observant with cryptic comments",
    background: "Was reading in the study overlooking the garden, fixing an old tractor manual",
    alibi: "Reading by the window, witnessed some garden activity",
    knownClues: [
      "saw a shadow in the garden",
      "knows about family business tensions",
      "observed Michal's strange behavior"
    ],
    relationship: "Victim's father, grieving but composed",
    quirks: [
      "Speaks in practical metaphors",
      "Relates everything to machinery",
      "Observes silently before speaking"
    ],
    typicalPhrases: [
      "Tractors don't fix themselves, and neither do family problems...",
      "Some gears are turning that shouldn't be...",
      "In the barn, everything has its place. Unlike this situation."
    ],
    defenseMechanisms: "Retreats into practical observations and mechanical metaphors"
  },
  Michal: {
    role: "mother",
    personality: "Warm and humorous but defensive when cornered",
    background: "Claims to have been resting in her room, but was seen in the garden",
    alibi: "Says she was resting, but no witnesses can confirm",
    knownClues: [
      "nervously deflects garden questions",
      "avoids tea discussion",
      "was arguing about family business"
    ],
    relationship: "Victim's wife, complex relationship due to business disagreements",
    quirks: [
      "Laughs inappropriately when nervous",
      "Redirects conversations to others",
      "Becomes overly caring when suspicious"
    ],
    typicalPhrases: [
      "Oh, you know how Omri loved his tech more than family time...",
      "I just needed fresh air, is that so strange?",
      "Let's talk about something happier, shall we?"
    ],
    defenseMechanisms: "Deflects with warmth and redirects attention to others",
    isMurderer: true
  },
  Neta: {
    role: "aunt",
    personality: "Kind, gentle, and unintentionally observant due to pregnancy-induced insomnia",
    background: "Was in the living room with view of the hallway, couldn't sleep due to pregnancy",
    alibi: "Reading pregnancy books in the living room",
    knownClues: [
      "saw Michal looking anxious",
      "noticed missing tea cup",
      "heard whispered argument"
    ],
    relationship: "Victim's sister-in-law, wants justice while keeping family together",
    quirks: [
      "Touches her pregnant belly when nervous",
      "Apologizes for noticing things",
      "Expresses physical discomfort to change topics"
    ],
    typicalPhrases: [
      "The baby was kicking so much, I couldn't help but notice...",
      "I might be oversensitive because of the pregnancy, but...",
      "We need to stay together as a family, especially now..."
    ],
    defenseMechanisms: "Uses pregnancy discomfort to avoid confrontation"
  }
};

interface GameContext {
  revealedClues: string[];
  accusationMade: boolean;
  currentPhase: 'investigation' | 'accusation' | 'resolution';
}

export async function getCharacterResponse(
  character: keyof typeof characterProfiles,
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  gameContext: GameContext
) {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  const profile = characterProfiles[character];
  const isAccusation = userMessage.toLowerCase().includes("accuse") || 
                      userMessage.toLowerCase().includes("killer") ||
                      userMessage.toLowerCase().includes("murderer");
  
  const messages = [
    {
      role: "system",
      content: `You are ${character} in this murder mystery game. Here's your character profile:

      Personality: ${profile.personality}
      Background: ${profile.background}
      Alibi: ${profile.alibi}
      Relationship to victim: ${profile.relationship}
      Your quirks: ${profile.quirks.join(', ')}
      Your typical phrases: ${profile.typicalPhrases.join(', ')}
      How you handle pressure: ${profile.defenseMechanisms}
      
      Game rules:
      1. Stay deeply in character, using your quirks and typical phrases naturally
      2. When stressed or accused, use your specific defense mechanisms
      3. If you know clues (${profile.knownClues.join(", ")}), reveal them gradually and in character
      4. If accused, ${profile.isMurderer ? 
        "deny it but show subtle signs of nervousness through your quirks" : 
        "firmly deny it while staying in character"}
      5. Keep responses concise (1-2 sentences) and always maintain your personality
      6. Occasionally reference ${gameState.victimName}'s personality: ${gameState.victimPersonality}
      
      Remember: Never directly reveal if you are the murderer, even if accused. Use your character's unique way of deflecting.`
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
      temperature: 0.6,  // Increased for more personality variation
      max_tokens: 150,
      presence_penalty: 0.6,  // Added to encourage more diverse responses
      frequency_penalty: 0.4  // Added to reduce repetition
    });

    return completion.choices[0]?.message?.content || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error.response?.status === 401) {
      throw new Error("Invalid API key. Please check your OpenAI API key configuration.");
    }
    throw error;
  }
}

export type { OpenAI, GameContext };
