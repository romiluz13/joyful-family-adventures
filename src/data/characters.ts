import { Character, PersonalityTrait } from '../types/Character';

export const RACHEL: Character = {
  id: 'rachel_01',
  name: 'Rachel',
  personality: {
    primaryTraits: [
      PersonalityTrait.LOUD,
      PersonalityTrait.HUMOROUS,
      PersonalityTrait.PROTECTIVE
    ],
    stressResponse: "Increases humor and dog references",
    quirks: [
      "Always relates situations to her dogs",
      "Makes tiger references",
      "Laughs in tense moments"
    ],
    defaultTone: "Energetic and playful"
  },
  backstory: "A devoted dog owner with a passion for big cats, Rachel's protective nature extends beyond her pets to her friends.",
  relationships: new Map([
    ['omri_01', { type: 'friend', trust: 75, details: "Enjoyed his tech jokes about her 'analog' lifestyle" }],
    ['neta_01', { type: 'protective', trust: 85, details: "Feels extra protective due to Neta's pregnancy" }]
  ]),
  knownSecrets: [
    "Was cleaning a suspicious item late at night",
    "Knows about Rom's argument with Omri"
  ],
  observations: new Map([
    ['21:30', "Saw Rom and Omri arguing about AI investments"],
    ['23:15', "Heard strange noises from the garden"]
  ]),
  stressLevel: 45,
  trustLevel: 70,
  isLying: false
};

export const ROM: Character = {
  id: 'rom_01',
  name: 'Rom',
  personality: {
    primaryTraits: [
      PersonalityTrait.COMPETITIVE,
      PersonalityTrait.DEFENSIVE
    ],
    stressResponse: "Becomes more accusatory towards others",
    quirks: [
      "Frequently mentions his business success",
      "Competitive even in casual conversations",
      "Deflects with tech industry jargon"
    ],
    defaultTone: "Assertive and challenging"
  },
  backstory: "A driven tech entrepreneur who had frequent disagreements with Omri about AI ethics and investment strategies.",
  relationships: new Map([
    ['omri_01', { type: 'rival', trust: 40, details: "Frequent arguments about AI technology" }],
    ['ilan_01', { type: 'dismissive', trust: 30, details: "Considers Ilan's work 'old-fashioned'" }]
  ]),
  knownSecrets: [
    "Had a heated argument with Omri about AI investments",
    "Lost money on a joint venture with Omri"
  ],
  observations: new Map([
    ['22:00', "Last argument with Omri about AI ethics"],
    ['23:30', "Saw Michal in the garden"]
  ]),
  stressLevel: 75,
  trustLevel: 45,
  isLying: true
};

export const ILAN: Character = {
  id: 'ilan_01',
  name: 'Ilan',
  personality: {
    primaryTraits: [
      PersonalityTrait.RESERVED,
      PersonalityTrait.OBSERVANT
    ],
    stressResponse: "Becomes more cryptic and withdrawn",
    quirks: [
      "Uses farming metaphors",
      "Long pauses before speaking",
      "Fidgets with tools"
    ],
    defaultTone: "Calm and measured"
  },
  backstory: "The estate's groundskeeper, Ilan prefers the company of plants to people but notices everything that happens on the grounds.",
  relationships: new Map([
    ['michal_01', { type: 'neutral', trust: 60, details: "Often sees her in the garden late at night" }],
    ['rom_01', { type: 'neutral', trust: 30, details: "Dislikes his dismissive attitude towards manual labor" }]
  ]),
  knownSecrets: [
    "Saw Michal burying something in the garden",
    "Knows about a hidden entrance to the study"
  ],
  observations: new Map([
    ['22:45', "Noticed Michal in the garden acting suspiciously"],
    ['23:00', "Heard arguing from the study window"]
  ]),
  stressLevel: 30,
  trustLevel: 65,
  isLying: false
};

export const MICHAL: Character = {
  id: 'michal_01',
  name: 'Michal',
  personality: {
    primaryTraits: [
      PersonalityTrait.WARM,
      PersonalityTrait.DEFENSIVE
    ],
    stressResponse: "Becomes overly friendly and deflective",
    quirks: [
      "Plays with her necklace when nervous",
      "Often changes the subject to cooking",
      "Nervous laughter"
    ],
    defaultTone: "Warm and motherly"
  },
  backstory: "A talented chef who takes pride in caring for everyone at the estate, but harbors deep resentment about recent changes.",
  relationships: new Map([
    ['neta_01', { type: 'friend', trust: 80, details: "Shares cooking recipes and pregnancy advice" }],
    ['omri_01', { type: 'complicated', trust: 45, details: "Disagreed about modernizing the kitchen" }]
  ]),
  knownSecrets: [
    "Was in the garden during suspicious hours",
    "Found a threatening note in the kitchen"
  ],
  observations: new Map([
    ['22:30', "Saw Rachel with something shiny in the kitchen"],
    ['23:45', "Heard a scream from the study"]
  ]),
  stressLevel: 65,
  trustLevel: 55,
  isLying: true
};

export const NETA: Character = {
  id: 'neta_01',
  name: 'Neta',
  personality: {
    primaryTraits: [
      PersonalityTrait.GENTLE,
      PersonalityTrait.HONEST
    ],
    stressResponse: "Becomes more protective of her unborn child",
    quirks: [
      "Rubs her belly when thinking",
      "Speaks softly but directly",
      "Often mentions her pregnancy cravings"
    ],
    defaultTone: "Soft and thoughtful"
  },
  backstory: "Expecting her first child, Neta's heightened awareness due to pregnancy has made her notice unusual patterns in the house.",
  relationships: new Map([
    ['rachel_01', { type: 'friend', trust: 85, details: "Appreciates Rachel's protective nature" }],
    ['michal_01', { type: 'friend', trust: 75, details: "Shares concerns about house tensions" }]
  ]),
  knownSecrets: [
    "Overheard Rachel cleaning something late at night",
    "Knows about tension between Rom and Omri"
  ],
  observations: new Map([
    ['21:00', "Saw Rom leaving Omri's study angrily"],
    ['22:15', "Heard metallic sounds from the kitchen"]
  ]),
  stressLevel: 40,
  trustLevel: 90,
  isLying: false
};

// Add more characters... 