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

// Message type definition
type MessageRole = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: MessageRole;
  content: string;
  character?: string;
}

function getRecentDiscussion(conversationHistory: ChatMessage[]): string {
  return conversationHistory
    .slice(-5)
    .map(msg => {
      if (msg.role === 'assistant' && msg.character) {
        return `${msg.character}: ${msg.content}`;
      }
      return `Detective: ${msg.content}`;
    })
    .join('\n');
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

  const messages: ChatMessage[] = [
    { role: 'system', content: systemMessage },
    ...conversationHistory.map(msg => ({
      role: msg.role as MessageRole,
      content: msg.content,
      character: msg.character
    })),
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
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
  characterTrust: number;  // Add this property instead of nested visibilityConditions
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

// Improved Interrogation System
interface InterrogationState {
  activeCharacters: string[];
  currentTension: number;
  revealedInformation: Set<string>;
  lastSpeaker: string;
  currentTopic: string;
  topicDepth: number;
}

// Helper Functions
function buildCharacterKnowledge(character: string): any {
  const gameContext: GameContext = {
    revealedClues: [],
    accusationMade: false,
    currentPhase: 'investigation',
    timelineProgress: { 
      dayBefore: true, 
      murderNight: true, 
      dayAfter: true 
    }
  };
  
  return {
    timeline: getTimelineKnowledge(character, gameContext),
    observations: generateInnocentObservations(character),
    personality: characters[character]
  };
}

function calculateTensionLevel(character: string, state: InterrogationState): number {
  const baseLevel = state.currentTension;
  const recentActivity = state.activeCharacters.includes(character) ? 0.2 : 0;
  return Math.min(baseLevel + recentActivity, 1.0);
}

function checkTopicRelevance(message: string, knowledge: any): boolean {
  const topics = ['weapon', 'location', 'time', 'motive'];
  return topics.some(topic => message.toLowerCase().includes(topic));
}

function generateDetailedResponse(character: string, message: string): Promise<string> {
  return getCharacterResponse(character, message, [], { 
    revealedClues: [], 
    accusationMade: false,
    currentPhase: 'investigation',
    timelineProgress: { dayBefore: true, murderNight: true, dayAfter: true }
  });
}

function generateDefensiveResponse(character: string): Promise<string> {
  const defensiveMessage = "I'd rather not discuss that right now.";
  return Promise.resolve(defensiveMessage);
}

function generateNormalResponse(character: string, message: string): Promise<string> {
  return getCharacterResponse(character, message, [], {
    revealedClues: [],
    accusationMade: false,
    currentPhase: 'investigation',
    timelineProgress: { dayBefore: true, murderNight: true, dayAfter: true }
  });
}

function calculateStressLevel(character: string, state: InterrogationState): number {
  const baseTension = state.currentTension;
  const topicStress = state.currentTopic === 'weapon' || state.currentTopic === 'location' ? 0.3 : 0;
  return Math.min(baseTension + topicStress, 1.0);
}

function generateDeflection(character: string): Promise<string> {
  const deflection = "Let's talk about something else. Have you asked Rom about what he saw?";
  return Promise.resolve(deflection);
}

function generateHelpfulResponse(character: string): Promise<string> {
  const helpful = "I want to help. What else would you like to know?";
  return Promise.resolve(helpful);
}

function validateTimeline(timeOfDeath: string): boolean {
  const validTimes = ['early evening', 'midnight', 'late night', 'before dawn', 'during dinner'];
  return validTimes.includes(timeOfDeath);
}

function checkWeaponAccessibility(weapon: string, location: string): boolean {
  const weaponLocations = {
    'kitchen knife': ['kitchen', 'dining room'],
    'heavy vase': ['living room', 'study'],
    'poison': ['kitchen', 'bathroom'],
    'rope': ['garden', 'garage'],
    'candlestick': ['living room', 'study', 'dining room']
  };
  return weaponLocations[weapon as keyof typeof weaponLocations]?.includes(location) ?? false;
}

function validateMotive(killer: string, motive: string): boolean {
  return motives[killer]?.includes(motive) ?? false;
}

function checkClueRelevance(clue: Evidence, topic: string): boolean {
  return clue.type === 'physical' ? topic === 'weapon' || topic === 'location' : true;
}

function checkRevealTiming(clue: Evidence, state: InterrogationState): boolean {
  return state.topicDepth >= 2;
}

function checkCharacterWillingness(character: string, clue: Evidence): boolean {
  return clue.characterTrust > 0.5;
}

function generateTransitionResponse(): string {
  return "Perhaps we should hear from someone else?";
}

function isTopicRelated(message: string, currentTopic: string): boolean {
  return message.toLowerCase().includes(currentTopic.toLowerCase());
}

function extractTopic(message: string): string {
  const topics = ['weapon', 'location', 'time', 'motive', 'alibi'];
  return topics.find(topic => message.toLowerCase().includes(topic)) || 'general';
}

// Group Interrogation System
interface GroupDiscussionState {
  activeCharacters: string[];
  currentSpeaker: string | null;
  lastSpeaker: string | null;
  discussionTopic: string;
  tensionLevel: number;
  revealedClues: Set<string>;
  characterEmotions: Record<string, {
    stress: number;
    defensiveness: number;
    suspicion: number;
  }>;
}

let groupDiscussion: GroupDiscussionState = {
  activeCharacters: [],
  currentSpeaker: null,
  lastSpeaker: null,
  discussionTopic: 'general',
  tensionLevel: 0,
  revealedClues: new Set(),
  characterEmotions: {}
};

// Enhanced character response system
export async function getGroupResponse(
  character: string,
  userMessage: string,
  conversationHistory: { role: string; content: string; character?: string }[],
  gameContext: GameContext
): Promise<string> {
  if (!gameState) throw new Error('Game state not initialized');

  const isKiller = character === gameState.killer;
  const characterProfile = characters[character];
  
  // Update group discussion state
  updateGroupState(character, userMessage);
  
  // Get relevant reactions from other characters
  const recentDiscussion = getRecentDiscussion(conversationHistory);
  const otherCharactersReactions = getRelevantReactions(character, recentDiscussion);
  
  // Build enhanced character knowledge
  const characterKnowledge = `
    ${isKiller ? getKillerKnowledge(character) : getInnocentKnowledge(character)}
    
    Recent Group Discussion:
    ${recentDiscussion}
    
    Other Characters' Reactions:
    ${otherCharactersReactions}
    
    Current Discussion Topic: ${groupDiscussion.discussionTopic}
    Room Tension Level: ${groupDiscussion.tensionLevel}
    
    Group Discussion Rules:
    1. React naturally to what others have said
    2. Build on or challenge others' statements
    3. Show appropriate emotional reactions
    4. Maintain consistent story across interactions
    5. Reference previous statements when relevant
    6. Form alliances or conflicts based on revealed information
    7. Express suspicion or support for others' claims
  `;

  const systemMessage = `
    You are ${character}, participating in a group investigation about Omri's murder.
    ${characterProfile}
    ${characterKnowledge}

    Response Guidelines:
    1. Stay in character and maintain your personality
    2. React to recent statements by other suspects
    3. Show appropriate emotional state
    4. Reference specific details from the discussion
    5. Build on or challenge others' claims naturally
    6. Keep responses concise (2-3 sentences)
    7. Mark important revelations with asterisks (*like this*)
    8. Avoid AI-style language or prefixes
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        ...conversationHistory.map(msg => ({
          role: msg.role as MessageRole,
          content: msg.content,
          character: msg.character
        })),
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    const generatedResponse = response.choices[0]?.message?.content || 'I need a moment to think about that.';
    updateEmotionsAndTension(character, generatedResponse);
    return generatedResponse;
  } catch (error) {
    console.error('Error in group response:', error);
    return 'I need a moment to collect my thoughts.';
  }
}

function updateGroupState(character: string, message: string): void {
  groupDiscussion.lastSpeaker = groupDiscussion.currentSpeaker;
  groupDiscussion.currentSpeaker = character;
  
  // Update topic if new one is detected
  const newTopic = extractTopic(message);
  if (newTopic !== 'general') {
    groupDiscussion.discussionTopic = newTopic;
  }
  
  // Initialize character emotions if needed
  if (!groupDiscussion.characterEmotions[character]) {
    groupDiscussion.characterEmotions[character] = {
      stress: 0,
      defensiveness: 0,
      suspicion: 0
    };
  }
}

function getRelevantReactions(character: string, recentDiscussion: string): string {
  const reactions = [];
  
  for (const otherChar of groupDiscussion.activeCharacters) {
    if (otherChar !== character) {
      const emotion = groupDiscussion.characterEmotions[otherChar];
      if (emotion.suspicion > 0.7) {
        reactions.push(`${otherChar} seems very suspicious of your statements`);
      } else if (emotion.stress > 0.7) {
        reactions.push(`${otherChar} appears notably stressed by the discussion`);
      }
    }
  }
  
  return reactions.join('\n');
}

function updateEmotionsAndTension(character: string, response: string): void {
  const emotions = groupDiscussion.characterEmotions[character];
  const isKiller = character === gameState?.killer;
  
  // Update character emotions based on response content
  if (response.toLowerCase().includes(gameState?.weapon || '') || 
      response.toLowerCase().includes(gameState?.location || '')) {
    emotions.stress += isKiller ? 0.2 : 0.1;
    emotions.defensiveness += isKiller ? 0.3 : 0.1;
  }
  
  // Update group tension
  const averageStress = Object.values(groupDiscussion.characterEmotions)
    .reduce((sum, e) => sum + e.stress, 0) / groupDiscussion.activeCharacters.length;
  groupDiscussion.tensionLevel = Math.min(1, averageStress);
}

function getKillerKnowledge(character: string): string {
  if (!gameState) return '';
  
  return `
    You are the killer. You killed Omri with the ${gameState.weapon} in the ${gameState.location} during ${gameState.timeOfDeath}.
    Your motive was ${gameState.motive}.
    
    Current Group Dynamic:
    - If others mention the weapon or location, show subtle stress
    - React defensively to accusations but maintain composure
    - Try to redirect suspicion naturally
    - Build alliances with characters who trust you
    - Challenge suspicious claims about your whereabouts
  `;
}

function getInnocentKnowledge(character: string): string {
  return `
    You are innocent and want to help solve the case.
    Your observations: ${generateInnocentObservations(character)}
    
    Current Group Dynamic:
    - Support claims that align with your observations
    - Question inconsistencies in others' stories
    - Form alliances with those who seem trustworthy
    - Share relevant information when appropriate
    - React genuinely to new revelations
  `;
}
