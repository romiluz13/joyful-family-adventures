import OpenAI from "openai";
import { characters } from "@/models/characters";

export const GAME_TITLE = "Who Killed Omri?";
export const GAME_INTRO = "Omri has been murdered. Interrogate the suspects to uncover the truth.";

export interface GameState {
  killer: string;
  weapon: string;
  location: string;
  timeOfDeath: string;
  motive: string;
}

export let gameState: GameState | null = null;

export interface GameContext {
  revealedClues: string[];
  accusationMade: boolean;
  currentPhase: 'investigation' | 'accusation' | 'resolution';
  timelineProgress: {
    dayBefore: boolean;
    murderNight: boolean;
    dayAfter: boolean;
  };
}

const weapons = [
  'kitchen knife',
  'heavy vase',
  'poison',
  'rope',
  'candlestick'
];

const locations = [
  'study',
  'garden',
  'kitchen',
  'living room',
  'bedroom'
];

const timeSlots = [
  'early evening',
  'midnight',
  'late night',
  'before dawn',
  'during dinner'
];

const motives: Record<string, string[]> = {
  Rachel: [
    'jealousy over Omri\'s success',
    'revenge for a past betrayal',
    'financial dispute over family inheritance'
  ],
  Rom: [
    'business rivalry gone wrong',
    'discovered Omri\'s secret dealings',
    'protecting family reputation'
  ],
  Ilan: [
    'long-standing family feud',
    'competition for leadership position',
    'revenge for personal humiliation'
  ],
  Michal: [
    'uncovered Omri\'s deception',
    'protecting someone close',
    'threatened by Omri\'s influence'
  ],
  Neta: [
    'silencing Omri\'s knowledge of wrongdoing',
    'preventing exposure of secrets',
    'eliminating business competition'
  ]
};

let lastKiller: string | null = null;

function selectRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function selectKiller(): string {
  const availableKillers = Object.keys(characters).filter(char => char !== lastKiller);
  const killer = selectRandomItem(availableKillers);
  lastKiller = killer;
  return killer;
}

export function initializeNewGame(): void {
  const killer = selectKiller();
  const weapon = selectRandomItem(weapons);
  const location = selectRandomItem(locations);
  const timeOfDeath = selectRandomItem(timeSlots);
  const killerMotives = motives[killer];
  const motive = selectRandomItem(killerMotives);

  gameState = {
    killer,
    weapon,
    location,
    timeOfDeath,
    motive
  };
}

// Initialize game state if not already done
if (!gameState) {
  initializeNewGame();
}

export function checkAccusation(accusedCharacter: string): { correct: boolean; explanation: string } {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }

  const isCorrect = accusedCharacter === gameState.killer;
  
  if (isCorrect) {
    return {
      correct: true,
      explanation: `Correct! ${gameState.killer} killed Omri with the ${gameState.weapon} in the ${gameState.location} during ${gameState.timeOfDeath}. The motive was ${gameState.motive}.`
    };
  } else {
    return {
      correct: false,
      explanation: 'That\'s not the killer. Try again!'
    };
  }
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const timeline = {
  dayBefore: {
    Rachel: "You witnessed the argument between Rom and Omri in the living room. Rom looked really angry.",
    Rom: "You had a heated argument with Omri about your AI project. He mocked your sales pitch.",
    Ilan: "You noticed tension between Omri and others throughout the day.",
    Michal: "You were seen in the kitchen cleaning a knife and acting unusually tense.",
    Neta: "You saw Michal cleaning a knife in the kitchen, which seemed odd."
  },
  murderNight: {
    Rachel: "Your dogs started barking around midnight.",
    Rom: "You were seen in the hallway near Omri's room, looking flustered.",
    Ilan: "You heard a thud near the study and thought it was someone moving furniture.",
    Michal: "You found Omri's body and were the first to raise the alarm.",
    Neta: "You heard footsteps near Omri's room but were too scared to check."
  },
  dayAfter: {
    Rachel: "You're trying to comfort everyone while subtly spreading suspicion about Rom.",
    Rom: "You noticed Michal acting jumpy all morning.",
    Ilan: "You're carefully observing everyone's reactions.",
    Michal: "You were seen doing laundry unusually early in the morning.",
    Neta: "You saw Michal near the laundry room early morning, which was unusual."
  }
};

function getTimelineKnowledge(character: string, gameContext: GameContext): string {
  const knowledge = [];
  
  if (gameContext.timelineProgress.dayBefore) {
    knowledge.push(timeline.dayBefore[character as keyof typeof timeline.dayBefore]);
  }
  if (gameContext.timelineProgress.murderNight) {
    knowledge.push(timeline.murderNight[character as keyof typeof timeline.murderNight]);
  }
  if (gameContext.timelineProgress.dayAfter) {
    knowledge.push(timeline.dayAfter[character as keyof typeof timeline.dayAfter]);
  }

  return knowledge.join('\n');
}

export async function getCharacterResponse(
  character: string,
  userMessage: string,
  conversationHistory: { role: string; content: string; character?: string }[],
  gameContext: GameContext
): Promise<string> {
  if (!gameState) {
    throw new Error('Game state not initialized');
  }

  const isKiller = character === gameState.killer;
  const characterProfile = characters[character];
  const timelineKnowledge = getTimelineKnowledge(character, gameContext);

  // Build character knowledge based on their role and game state
  let characterKnowledge = '';
  if (isKiller) {
    characterKnowledge = `
      You are the killer. You killed Omri with the ${gameState.weapon} in the ${gameState.location} during ${gameState.timeOfDeath}.
      Your motive was ${gameState.motive}.
      
      Timeline Knowledge:
      ${timelineKnowledge}
      
      Group Discussion Rules:
      1. Never directly reveal you're the killer
      2. React to other characters' statements naturally
      3. If others mention the ${gameState.weapon}, ${gameState.location}, or your whereabouts, become defensive
      4. Try to deflect suspicion onto others, especially if they're getting close to the truth
      5. Show subtle signs of stress when topics get close to your involvement
      6. Occasionally make small slips that might hint at your guilt
      7. If others accuse you, deny it but show signs of nervousness
    `;
  } else {
    const observations = generateInnocentObservations(character);
    characterKnowledge = `
      You are innocent and want to help find Omri's killer.
      
      Timeline Knowledge:
      ${timelineKnowledge}
      
      Your Observations:
      ${observations}
      
      Group Discussion Rules:
      1. React to other characters' statements and build on their observations
      2. If you notice inconsistencies in others' stories, point them out
      3. Share your observations when relevant to the current topic
      4. Show genuine concern about finding the killer
      5. Mark truly important information with asterisks (*like this*)
      6. If others mention something that connects to your knowledge, speak up
      7. Maintain your character's personality while interacting with others
    `;
  }

  // Include recent messages from other characters for context
  const recentDiscussion = conversationHistory
    .slice(-5)
    .map(msg => {
      if (msg.role === 'assistant') {
        return `${msg.character}: ${msg.content}`;
      }
      return `Detective: ${msg.content}`;
    })
    .join('\n');

  const systemMessage = `
    You are ${character}, one of the suspects in Omri's murder case.
    ${characterProfile}
    ${characterKnowledge}

    Recent Discussion:
    ${recentDiscussion}

    Conversation Rules:
    1. Stay in character at all times
    2. Keep responses concise (2-3 sentences)
    3. Mark important clues with asterisks (*like this*)
    4. React to what others have said in the discussion
    5. Show personality through speech patterns
    6. Use your character's typical phrases naturally
    7. Don't use AI language or prefixes
    8. If others reveal important information, acknowledge it
    9. Build on or challenge others' statements when appropriate
  `;

  const messages = [
    { role: 'system', content: systemMessage },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    return response.choices[0]?.message?.content || 'I\'m not sure how to respond to that.';
  } catch (error) {
    console.error('Error getting response from OpenAI:', error);
    return 'I\'m having trouble responding right now. Please try again.';
  }
}

// Helper function to generate observations for innocent characters
function generateInnocentObservations(character: string): string {
  if (!gameState) return '';

  // Each character has unique observations based on their relationship to the crime
  const timeContext = {
    'early evening': 'around 6-7 PM',
    'midnight': 'around midnight',
    'late night': 'between 1-3 AM',
    'before dawn': 'around 4-5 AM',
    'during dinner': 'during dinner time (around 8 PM)'
  };

  const locationContext = {
    'study': 'in Omri\'s private study',
    'garden': 'in the back garden',
    'kitchen': 'in the main kitchen',
    'living room': 'in the family living room',
    'bedroom': 'near the upstairs bedrooms'
  };

  // Generate more specific and helpful observations
  const observations = {
    Rachel: `
      *Your dogs became unusually agitated ${timeContext[gameState.timeOfDeath as keyof typeof timeContext]}*.
      You noticed someone rushing away from ${locationContext[gameState.location as keyof typeof locationContext]}.
      *You saw the ${gameState.weapon} being moved from its usual place that evening*.
      You overheard a heated argument about ${gameState.motive.split(' ')[0]}.
    `,
    Rom: `
      *You heard distinct footsteps ${timeContext[gameState.timeOfDeath as keyof typeof timeContext]}*.
      You saw someone acting suspiciously near ${locationContext[gameState.location as keyof typeof locationContext]}.
      *You noticed the ${gameState.weapon} wasn't in its usual spot later*.
      You remember an intense discussion about ${gameState.motive.split(' ')[0]}.
    `,
    Ilan: `
      *You spotted unusual movement ${timeContext[gameState.timeOfDeath as keyof typeof timeContext]}*.
      You observed someone entering ${locationContext[gameState.location as keyof typeof locationContext]}.
      *The ${gameState.weapon} caught your attention earlier that day*.
      You recall tension regarding ${gameState.motive.split(' ')[0]}.
    `,
    Michal: `
      *You noticed strange noises ${timeContext[gameState.timeOfDeath as keyof typeof timeContext]}*.
      You saw someone leaving ${locationContext[gameState.location as keyof typeof locationContext]} hastily.
      *The ${gameState.weapon} seemed to have been recently moved*.
      You sensed conflict about ${gameState.motive.split(' ')[0]}.
    `,
    Neta: `
      *The baby's movements made you restless ${timeContext[gameState.timeOfDeath as keyof typeof timeContext]}*.
      You glimpsed someone in ${locationContext[gameState.location as keyof typeof locationContext]}.
      *You remember seeing the ${gameState.weapon} being handled oddly*.
      You felt tension regarding ${gameState.motive.split(' ')[0]}.
    `
  };

  return observations[character as keyof typeof observations] || '';
}

// Advanced Character Memory System
interface CharacterMemory {
  knownClues: Set<string>;
  suspicionsAbout: Record<string, number>;  // character -> suspicion level
  emotionalState: {
    stress: number;
    defensiveness: number;
    nervousness: number;
  };
  conversationHistory: {
    withCharacter: string;
    topic: string;
    timestamp: number;
  }[];
}

// Personality Influence System
interface PersonalityTraits {
  deceptionSkill: number;      // How well they can lie (0-1)
  observationSkill: number;    // How well they notice details (0-1)
  emotionalControl: number;    // How well they control reactions (0-1)
  aggressiveness: number;      // How forceful their accusations are (0-1)
}

// Enhanced Evidence System
interface Evidence {
  id: string;
  type: 'physical' | 'testimony' | 'circumstantial';
  reliability: number;         // How trustworthy (0-1)
  visibilityThreshold: number; // When it becomes noticeable
  connections: string[];       // Related evidence IDs
  contradictions: string[];    // Contradicting evidence IDs
}

// Dynamic Difficulty Adjustment
interface DifficultyManager {
  baseLevel: number;          // Initial difficulty (1-10)
  playerPerformance: number;  // How well player is doing (0-1)
  adaptationRate: number;     // How quickly difficulty adjusts
  clueRevealRate: number;     // How often new clues appear
}

// Relationship Network
interface RelationshipNetwork {
  relationships: Map<string, Map<string, {
    type: string;
    trust: number;
    sharedSecrets: string[];
    pastConflicts: string[];
  }>>;
}

// Timeline Event System
interface TimelineEvent {
  time: string;
  location: string;
  participants: string[];
  witnesses: string[];
  cluesGenerated: string[];
  impactOnRelationships: Record<string, number>;
}

function updateCharacterBehavior(
  character: string,
  gameContext: GameContext,
  memory: CharacterMemory,
  personality: PersonalityTraits
): void {
  const stressThreshold = personality.emotionalControl * 0.7;
  const isUnderPressure = memory.emotionalState.stress > stressThreshold;

  // Adjust behavior based on emotional state
  if (isUnderPressure) {
    memory.emotionalState.defensiveness += 0.2;
    memory.emotionalState.nervousness += 0.15;
  }

  // Update suspicions based on known clues
  for (const clue of memory.knownClues) {
    // Logic to update suspicions...
  }
}

function generateCharacterResponse(
  character: string,
  context: GameContext,
  memory: CharacterMemory,
  personality: PersonalityTraits,
  relationships: RelationshipNetwork
): string {
  const isKiller = character === gameState?.killer;
  const stressLevel = memory.emotionalState.stress;
  const deceptionSuccess = Math.random() < personality.deceptionSkill;

  if (isKiller && !deceptionSuccess) {
    // Add subtle tells in the response
    memory.emotionalState.nervousness += 0.1;
  }

  // Generate response based on all factors...
  return "Character response considering all factors";
}
