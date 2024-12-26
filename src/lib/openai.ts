import OpenAI from "openai";

if (!import.meta.env.VITE_OPENAI_API_KEY) {
  console.error("OpenAI API key is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

export const GAME_TITLE = "Who Killed Omri?";

export const GAME_INTRO = `Welcome Detective!

Omri was found dead in his study last night. As the family's detective, you must interrogate five suspects:

• Rachel (Grandmother) - Protective of her dogs, knows family secrets
• Rom (Brother) - Tech rival, had recent arguments with Omri
• Ilan (Father) - Traditional businessman, disapproved of Omri's methods
• Michal (Wife) - Had recent conflicts over the family business
• Neta (Sister-in-law) - Pregnant, often awake at night

Each suspect has their own story. Look for inconsistencies and hidden clues.
You have 3 attempts to identify the killer. Choose wisely!`;

interface GameState {
  killer: string;
  weapon: string;
  motive: string;
}

// Simplified character profiles
export const characterProfiles = {
  Rachel: {
    role: "Omri's mother-in-law",
    alibi: "Was in her room with her dogs",
    keyInfo: "Her dogs were barking unusually around midnight",
    suspiciousAbout: "Rom's strange behavior in the hallway"
  },
  Rom: {
    role: "Omri's brother and tech rival",
    alibi: "Claims to have been in the garden shed",
    keyInfo: "Had a heated argument with Omri about AI investments",
    suspiciousAbout: "Michal's early morning activities"
  },
  Ilan: {
    role: "Omri's traditional father",
    alibi: "Reading in the study overlooking the garden",
    keyInfo: "Saw a shadow in the garden during critical time",
    suspiciousAbout: "Unusual sounds from Omri's room"
  },
  Michal: {
    role: "Omri's wife",
    alibi: "Says she was sleeping",
    keyInfo: "Found cleaning supplies moved in the morning",
    suspiciousAbout: "Missing items from Omri's study"
  },
  Neta: {
    role: "Omri's sister-in-law",
    alibi: "Awake due to pregnancy insomnia",
    keyInfo: "Witnessed suspicious activity in the hallway",
    suspiciousAbout: "Strange noises from the study"
  }
};

const weapons = ["kitchen knife", "heavy trophy", "poisoned drink", "letter opener", "silk scarf"];

const motives = {
  Rachel: [
    "Omri threatened to send her dogs away",
    "Omri was selling the family house",
    "Omri discovered her gambling debts"
  ],
  Rom: [
    "Omri refused to fund his AI project",
    "Omri was going to expose his failed business",
    "Omri had evidence of his scam"
  ],
  Ilan: [
    "Omri was changing the family business",
    "Omri threatened to sell the company",
    "Omri found his secret accounts"
  ],
  Michal: [
    "Omri discovered her affair",
    "Omri was changing his will",
    "Omri found her stolen money"
  ],
  Neta: [
    "Omri knew her pregnancy was fake",
    "Omri was exposing her past",
    "Omri caught her stealing"
  ]
};

function selectRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Store last killer in localStorage
function getLastKiller(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('lastKiller');
  }
  return null;
}

function setLastKiller(killer: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastKiller', killer);
  }
}

function selectKiller(possibleKillers: string[]): string {
  const lastKiller = getLastKiller();
  const availableKillers = lastKiller 
    ? possibleKillers.filter(k => k !== lastKiller)
    : possibleKillers;
  
  const newKiller = selectRandomItem(availableKillers);
  setLastKiller(newKiller);
  return newKiller;
}

export function initializeGameState(): GameState {
  const possibleKillers = ["Rachel", "Rom", "Ilan", "Michal", "Neta"];
  const killer = selectKiller(possibleKillers);
  
  return {
    killer,
    weapon: selectRandomItem(weapons),
    motive: selectRandomItem(motives[killer])
  };
}

export const gameState = initializeGameState();

export async function getCharacterResponse(
  character: keyof typeof characterProfiles,
  userMessage: string,
  conversationHistory: any[]
): Promise<string> {
  const profile = characterProfiles[character];
  const isKiller = character === gameState.killer;
  
  const systemMessage = `You are ${character}, ${profile.role}. 
You are being questioned about Omri's murder.

YOUR KNOWLEDGE:
- Your alibi: ${profile.alibi}
- What you know: ${profile.keyInfo}
- What makes you suspicious: ${profile.suspiciousAbout}
${isKiller ? `- You killed Omri because: ${gameState.motive}
- You used: ${gameState.weapon}` : ''}

RESPONSE RULES:
1. Keep responses short (1-2 sentences)
2. If you're the killer:
   - Be evasive but drop subtle hints
   - Show nervousness when pressed about your alibi
   - Never directly admit guilt
3. If innocent:
   - Be helpful but only share what you know
   - Express genuine concern about finding the killer
4. Mark important clues with asterisks: *important clue*

Example responses:
- "I was reading when *I heard footsteps in the hallway*"
- "*The garden shears were moved* but I didn't think much of it then"`;

  const messages = [
    { role: "system", content: systemMessage },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ];

  try {
    const completion = await openai.chat.completions.create({
      messages: messages as any,
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 150
    });

    return completion.choices[0]?.message?.content || "I need a moment to think about that.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

export function checkAccusation(accusedCharacter: string): {
  correct: boolean;
  explanation: string;
} {
  const isCorrect = accusedCharacter === gameState.killer;
  
  return {
    correct: isCorrect,
    explanation: isCorrect
      ? `Correct! ${gameState.killer} killed Omri with the ${gameState.weapon} because ${gameState.motive}.`
      : `Wrong! Keep investigating. Omri's killer is still out there.`
  };
}
