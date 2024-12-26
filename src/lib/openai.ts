import OpenAI from "openai";

if (!import.meta.env.VITE_OPENAI_API_KEY) {
  console.error("OpenAI API key is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

// Timeline events that characters can reference
export const timeline = {
  dayBefore: {
    afternoon: {
      event: "Heated argument between Omri and Rom about AI sales pitch",
      location: "living room",
      witnesses: ["Rachel", "Neta"],
      details: "Omri mocked Rom's approach to AI, causing visible anger"
    },
    evening: {
      event: "Suspicious activity in the kitchen",
      location: "kitchen",
      witnesses: ["Neta", "Ilan"],
      details: "Michal seen cleaning a knife, appearing tense"
    }
  },
  murderNight: {
    lateEvening: {
      event: "Omri working on AI prototype",
      location: "study",
      witnesses: ["Rachel", "Michal"],
      details: "Omri messaged Michal about an important discussion"
    },
    midnight: {
      event: "Suspicious noises and movement",
      location: "near Omri's room",
      witnesses: ["Ilan", "Neta", "Rachel"],
      details: "Loud thud heard, footsteps, Rom seen leaving hallway"
    },
    afterMidnight: {
      event: "Body discovered",
      location: "Omri's room",
      witnesses: ["Michal", "Rachel"],
      details: "Door slightly ajar, dogs barking"
    }
  },
  dayAfter: {
    earlyMorning: {
      event: "Suspicious laundry activity",
      location: "laundry room",
      witnesses: ["Neta"],
      details: "Michal washing clothes at unusual hour"
    }
  }
};

// Game state and core mystery elements
interface GameState {
  killer: string;
  motive: string;
  weapon: string;
  location: string;
  timeOfDeath: string;
}

const weapons = [
  "kitchen knife",
  "heavy book",
  "garden shears",
  "old trophy",
  "poisoned tea"
];

const locations = [
  "kitchen",
  "garden",
  "study room",
  "living room",
  "backyard"
];

const timeSlots = [
  "just after dinner",
  "late at night",
  "early morning",
  "during afternoon tea",
  "before breakfast"
];

const motives = {
  Rachel: [
    "Omri threatened to send her dogs to a shelter",
    "Omri was planning to sell the family house",
    "Omri discovered her gambling debts"
  ],
  Rom: [
    "Omri was going to expose his failed startup",
    "Omri refused to invest in his new tech venture",
    "Omri threatened to reveal his internet scam"
  ],
  Ilan: [
    "Omri discovered his secret second family",
    "Omri was going to change the will",
    "Omri found evidence of his past crimes"
  ],
  Michal: [
    "Omri was about to reveal her affair",
    "Omri threatened to take away her inheritance",
    "Omri discovered her stolen family heirlooms"
  ],
  Neta: [
    "Omri knew about her fake pregnancy",
    "Omri was going to expose her true identity",
    "Omri discovered she was stealing from the family"
  ]
};

function selectRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function initializeGameState(): GameState {
  const possibleKillers = ["Rachel", "Rom", "Ilan", "Michal", "Neta"];
  const killer = selectRandomItem(possibleKillers);
  
  return {
    killer,
    weapon: selectRandomItem(weapons),
    location: selectRandomItem(locations),
    timeOfDeath: selectRandomItem(timeSlots),
    motive: selectRandomItem(motives[killer])
  };
}

export const gameState = initializeGameState();

// Define clue categories to help track progress
export const clueCategories = {
  motive: "Business disagreements and family tensions",
  opportunity: "Access and timing around the murder",
  evidence: "Physical evidence and suspicious behavior",
  alibi: "Witness accounts and timeline discrepancies",
  character: "Personality traits and relationships"
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
  timeline: {
    dayBefore?: string;
    murderNight?: string;
    dayAfter?: string;
  };
  isMurderer?: boolean;
}

// Updated character profiles with timeline-specific knowledge
export const characterProfiles: Record<string, CharacterProfile> = {
  Rachel: {
    role: "grandmother",
    personality: "Loud, expressive, and humorous even in serious moments",
    background: "Was in the kitchen preparing dinner, constantly talking about her dogs Shawn and Louie",
    alibi: "Was in her room with her dogs, who started barking around midnight",
    knownClues: [
      "Heard Rom and Omri's heated argument about AI",
      "Dogs were unusually agitated around midnight",
      "Saw Rom looking flustered in the hallway",
      "Noticed Omri was working late again"
    ],
    relationship: "Victim's mother, uses humor to cope with loss",
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
    defenseMechanisms: "Deflects tension with humor and dog stories",
    timeline: {
      dayBefore: "Witnessed the argument between Rom and Omri",
      murderNight: "Dogs started barking at midnight",
      dayAfter: "Trying to comfort everyone while spreading subtle suspicion about Rom"
    }
  },
  Rom: {
    role: "uncle",
    personality: "Energetic, competitive, defensive about his AI business",
    background: "Had a heated argument with Omri about his AI sales pitch",
    alibi: "Claims to have been in the garden shed, but was seen in the hallway",
    knownClues: [
      "Argument with Omri about AI investments",
      "Noticed disturbed area in garden",
      "Heard footsteps and rustling",
      "Observed Michal's strange behavior morning after"
    ],
    relationship: "Victim's brother, competitive but loving relationship",
    quirks: [
      "Always brings up his AI business",
      "Competes with others' stories",
      "Gets defensive about his tech knowledge"
    ],
    typicalPhrases: [
      "My AI could solve this case faster than any of us!",
      "Sure, we argued, but that doesn't make me a killer!",
      "Omri never understood the potential of my projects..."
    ],
    defenseMechanisms: "Points out others' flaws when feeling threatened",
    timeline: {
      dayBefore: "Had a heated argument with Omri about AI",
      murderNight: "Working in garden shed, later seen in hallway",
      dayAfter: "Noticed Michal acting strangely"
    }
  },
  Ilan: {
    role: "grandfather",
    personality: "Reserved, practical, observant with cryptic comments",
    background: "Was reading in the study overlooking the garden",
    alibi: "Reading by the window, witnessed garden activity",
    knownClues: [
      "Saw shadow in garden during critical time",
      "Knows about family business tensions",
      "Heard thud near study",
      "Observed Michal's unusual behavior"
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
    defenseMechanisms: "Retreats into practical observations and mechanical metaphors",
    timeline: {
      dayBefore: "Noticed tension between Omri and others",
      murderNight: "Heard suspicious noises from study",
      dayAfter: "Observing everyone's reactions carefully"
    }
  },
  Michal: {
    role: "mother",
    personality: "Warm and humorous but defensive when cornered",
    background: "Had recent disagreements with Omri about family business",
    alibi: "Claims to have been resting, but was seen in various locations",
    knownClues: [
      "Was cleaning a knife suspiciously",
      "Received message from Omri",
      "Found the body",
      "Early morning laundry activity"
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
    timeline: {
      dayBefore: "Seen cleaning knife in kitchen",
      murderNight: "Claims to have been resting, found body",
      dayAfter: "Doing laundry early morning"
    },
    isMurderer: true
  },
  Neta: {
    role: "aunt",
    personality: "Kind, gentle, unintentionally observant due to pregnancy-induced insomnia",
    background: "Couldn't sleep due to pregnancy, witnessed various events",
    alibi: "Reading pregnancy books in living room with view of hallway",
    knownClues: [
      "Saw Michal looking anxious",
      "Noticed missing tea cup",
      "Heard whispered argument",
      "Witnessed early morning laundry activity"
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
    defenseMechanisms: "Uses pregnancy discomfort to avoid confrontation",
    timeline: {
      dayBefore: "Noticed knife cleaning incident",
      murderNight: "Heard footsteps and voices",
      dayAfter: "Saw Michal's suspicious laundry activity"
    }
  }
};

interface GameContext {
  revealedClues: string[];
  accusationMade: boolean;
  currentPhase: 'investigation' | 'accusation' | 'resolution';
  timelineProgress: {
    dayBefore: boolean;
    murderNight: boolean;
    dayAfter: boolean;
  };
}

type MessageRole = "system" | "user" | "assistant";

interface ChatMessage {
  role: MessageRole;
  content: string;
}

export async function getCharacterResponse(
  character: keyof typeof characterProfiles,
  userMessage: string,
  conversationHistory: ChatMessage[],
  gameContext: GameContext
) {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  const profile = characterProfiles[character];
  const filteredHistory = conversationHistory.filter(msg => msg.role !== "system");
  
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are ${character} in the murder mystery game "Who Killed Omri?". Follow these instructions carefully:

CHARACTER PROFILE:
- You are: ${profile.personality}
- Your relationship with Omri: ${profile.relationship}
- Your quirks: ${profile.quirks.join(', ')}
- Your typical phrases: ${profile.typicalPhrases.join(', ')}
- When pressured: ${profile.defenseMechanisms}

YOUR TIMELINE KNOWLEDGE:
1. Day Before Murder:
   - Afternoon: ${character === "Rom" || character === "Rachel" ? 
     "You witnessed/were part of the heated argument about AI sales pitch" : 
     "You heard about an argument between Rom and Omri"}
   - Evening: ${character === "Michal" || character === "Neta" ? 
     "You were involved in/witnessed the kitchen incident" : 
     "You were elsewhere in the house"}

2. Murder Night:
   - Late Evening: ${character === "Michal" ? 
     "Omri messaged you about meeting" : 
     character === "Rachel" ? 
     "You noticed Omri working late" : 
     "Nothing specific"}
   - Midnight: ${profile.timeline.murderNight}
   - After Midnight: ${character === "Michal" ? 
     "You discovered the body" : 
     character === "Rachel" ? 
     "Your dogs were barking" : 
     "You heard about the discovery"}

3. Morning After:
   ${profile.timeline.dayAfter}

RESPONSE RULES:
1. Stay completely in character using your quirks and phrases
2. Keep responses to 1-2 sentences maximum
3. When revealing key information, mark it with * at the start and end
   For example:
   - *I saw Michal in the garden at midnight*
   - *Rom was arguing with Omri about the AI project*
4. If asked about events you didn't witness:
   - Say you only heard about it from others
   - Be vague but stay in character
5. If accused: ${profile.isMurderer ? 
     "Show subtle nervousness through your quirks but deny involvement" : 
     "Firmly deny while staying in character"}

Remember: Never directly state if you are the murderer. Use your character's unique way of deflecting.`
    },
    ...filteredHistory,
    { role: "user", content: userMessage }
  ];

  try {
    const completion = await openai.chat.completions.create({
      messages: messages as any,
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.7,
      frequency_penalty: 0.5,
      top_p: 0.9,
      stop: ["User:", "Assistant:", "\n\n"]
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

export function checkAccusation(accusedCharacter: string): {
  correct: boolean;
  explanation: string;
} {
  const isCorrect = accusedCharacter === gameState.killer;
  
  return {
    correct: isCorrect,
    explanation: isCorrect
      ? `Correct! ${gameState.killer} killed Omri in the ${gameState.location} with the ${gameState.weapon} ${gameState.timeOfDeath} because ${gameState.motive}.`
      : `Wrong! Keep investigating. The real killer is still out there.`
  };
}

export type { OpenAI, GameContext, ChatMessage, MessageRole };
