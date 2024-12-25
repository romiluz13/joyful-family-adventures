import { Location } from './Character';

export interface GameRules {
  introduction: {
    title: string;
    description: string;
    victimName: string;
    startButtonText: string;
  };

  suspects: Array<{
    name: keyof typeof characterProfiles;
    introLine: string;
    initialEvidence: string[];
  }>;

  clues: {
    [key: string]: {
      description: string;
      revealedBy: string;
      relatedTo: string[];
      isKey: boolean;
    };
  };

  locations: {
    [K in Location]: {
      description: string;
      availableClues: string[];
      significance: string;
    };
  };

  interrogation: {
    standardQuestions: string[];
    characterSpecificQuestions: {
      [character: string]: string[];
    };
    maxQuestionsPerSession: number;
  };

  accusation: {
    requiredClues: number;
    correctSuspect: string;
    motive: string;
    evidence: string[];
    wrongAccusationPenalty: string;
  };

  scoring: {
    maxScore: number;
    cluePoints: number;
    correctAccusationPoints: number;
    wrongAccusationPenalty: number;
    timeBonus: {
      threshold: number;
      points: number;
    };
  };
}

export const gameRules: GameRules = {
  introduction: {
    title: "The Family Mystery",
    description: "A peaceful family gathering turns tragic when Omri is found dead in his study. As the investigator, you must uncover the truth by questioning the family members and gathering evidence.",
    victimName: "Omri",
    startButtonText: "Start Investigation"
  },

  suspects: [
    {
      name: "Rachel",
      introLine: "Oh dear, what a terrible thing to happen... My dogs Shawn and Louie have been restless all night. Animals can sense these things, you know.",
      initialEvidence: ["Was seen cleaning a knife late at night", "Claims it was for breakfast preparation"]
    },
    {
      name: "Rom",
      introLine: "This is ridiculous. Sure, Omri and I had our disagreements about AI, but I'd never... I mean, he was wrong, but not wrong enough to...",
      initialEvidence: ["Had a heated argument with Omri about AI", "No solid alibi for the time of death"]
    },
    {
      name: "Ilan",
      introLine: "I keep to myself in the barn most nights. Machinery needs constant attention. But I see things, hear things...",
      initialEvidence: ["Witnessed Michal in the garden", "Claims to have been in the barn all night"]
    },
    {
      name: "Michal",
      introLine: "I just needed some fresh air last night. Is that so suspicious? Everyone deals with stress differently...",
      initialEvidence: ["Was spotted in the garden at an unusual hour", "Appears nervous during questioning"]
    },
    {
      name: "Neta",
      introLine: "I couldn't sleep last night... the baby was kicking. That's when I heard... well, maybe I shouldn't say...",
      initialEvidence: ["Overheard suspicious sounds", "Witnessed Rachel with a knife"]
    }
  ],

  clues: {
    knife: {
      description: "A kitchen knife was found cleaned recently",
      revealedBy: "Neta",
      relatedTo: ["Rachel", "Kitchen"],
      isKey: true
    },
    gardenVisit: {
      description: "Michal was seen in the garden late at night",
      revealedBy: "Ilan",
      relatedTo: ["Michal", "Garden"],
      isKey: true
    },
    aiArgument: {
      description: "Rom and Omri had a heated argument about AI",
      revealedBy: "Rom",
      relatedTo: ["Rom", "Study"],
      isKey: false
    },
    missingFiles: {
      description: "Important AI research files are missing from Omri's study",
      revealedBy: "Michal",
      relatedTo: ["Study", "Rom"],
      isKey: true
    },
    brokenGlasses: {
      description: "Omri's broken glasses found in the garden",
      revealedBy: "Rachel",
      relatedTo: ["Garden", "Michal"],
      isKey: true
    }
  },

  interrogation: {
    standardQuestions: [
      "Where were you at the time of the murder?",
      "Did you notice anything unusual that night?",
      "What was your relationship with Omri like?",
      "Can anyone confirm your whereabouts?"
    ],
    characterSpecificQuestions: {
      Rachel: [
        "Why were you cleaning a knife so late?",
        "Did your dogs react to anything unusual?"
      ],
      Rom: [
        "What was your argument with Omri about?",
        "Did he threaten to expose something about your AI work?"
      ],
      Ilan: [
        "What exactly did you see in the garden?",
        "Why were you in the barn so late?"
      ],
      Michal: [
        "Why did you go to the garden at night?",
        "Did you know about Omri's AI research?"
      ],
      Neta: [
        "What sounds did you hear exactly?",
        "Did you see anyone else besides Rachel?"
      ]
    },
    maxQuestionsPerSession: 3
  },

  accusation: {
    requiredClues: 4,
    correctSuspect: "Michal",
    motive: "Michal discovered Omri was about to expose flaws in her research that would ruin her career",
    evidence: [
      "Garden visit timing matches time of death",
      "Broken glasses found in garden",
      "Missing research files",
      "Defensive behavior during questioning"
    ],
    wrongAccusationPenalty: "Loss of one attempt, key evidence revealed"
  },

  scoring: {
    maxScore: 1000,
    cluePoints: 50,
    correctAccusationPoints: 500,
    wrongAccusationPenalty: 100,
    timeBonus: {
      threshold: 600, // 10 minutes
      points: 200
    }
  }
};

export const getInitialGameState = () => ({
  currentPhase: "introduction" as const,
  discoveredClues: new Set<string>(),
  questionedSuspects: new Set<string>(),
  remainingQuestions: 3,
  score: 0,
  startTime: Date.now(),
  attempts: 3,
  gameOver: false
}); 