import { useState, useEffect } from 'react';
import { getGroupResponse, GAME_TITLE, GAME_INTRO, type GameContext, checkAccusation } from '@/lib/openai';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { characters } from '@/models/characters';
import { FaUserSecret, FaUsers, FaUser, FaSpinner, FaSkull, FaClock, FaStickyNote, FaTimes, FaSearch, FaTag, FaBook, FaCode, FaUserTie, FaMapMarkerAlt } from 'react-icons/fa';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { gameState, GameState, characterPersonalities } from '@/lib/openai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  character?: string;
}

interface HighScore {
  time: number;
  date: string;
  correct: boolean;
}

interface TimelineClue {
  id: string;
  time: 'before' | 'during' | 'after';
  content: string;
  source: string;
  timestamp: number;
  category: 'location' | 'weapon' | 'motive' | 'alibi' | 'relationship' | 'evidence' | 'general';
  important: boolean;
}

interface CharacterRelationship {
  title: string;
  relationships: Record<string, string>;
}

// Helper function to extract important information marked with asterisks
const extractImportantInfo = (text: string): string[] => {
  const matches = text.match(/\*(.*?)\*/g);
  if (!matches) return [];
  
  // Clean up the matches and remove duplicates
  return [...new Set(
    matches.map(match => match.replace(/^\*|\*$/g, '').trim())
    .filter(clue => {
      // Filter out non-clue statements
      const lowerClue = clue.toLowerCase();
      const nonCluePatterns = [
        'line up our stories',
        'we need to be careful',
        'watch what you say',
        'keep quiet',
        'stay silent',
        'remember',
        'don\'t forget',
        'make sure',
        'be careful',
        'important to note',
        'pay attention'
      ];
      
      return !nonCluePatterns.some(pattern => lowerClue.includes(pattern));
    })
  )];
};

// Helper functions for game logic display
function getCharacterAlibi(character: string): string {
  if (!gameState) return '';
  
  const alibis = {
    Rachel: gameState.killer === 'Rachel' ? 
      "Claimed to be in room with dogs" : "In room with dogs all night",
    Rom: gameState.killer === 'Rom' ? 
      "Claimed to be at a business conference" : "At home working on AI project",
    Ilan: gameState.killer === 'Ilan' ? 
      "Claimed to be in the barn" : "In the barn checking equipment",
    Michal: gameState.killer === 'Michal' ? 
      "Claimed to be sleeping" : "Sleeping in room",
    Neta: gameState.killer === 'Neta' ? 
      "Claimed to be resting due to pregnancy" : "Resting due to pregnancy discomfort"
  };
  
  return alibis[character as keyof typeof alibis] || '';
}

function getCharacterTimeline(character: string, period: 'dayBefore' | 'murderNight' | 'dayAfter'): string {
  if (!gameState) return '';
  
  const timeline = {
    dayBefore: {
      Rachel: gameState.killer === 'Rachel' ? 
        `Made sure ${gameState.location} was empty during dinner` :
        `Noticed suspicious activity near ${gameState.location}`,
      Rom: gameState.killer === 'Rom' ? 
        `Prepared the ${gameState.weapon} while working` :
        `Saw someone acting suspiciously`,
      Ilan: gameState.killer === 'Ilan' ? 
        'Established alibi in barn' :
        'Noticed unusual movements',
      Michal: gameState.killer === 'Michal' ? 
        'Mentioned being tired early' :
        'Observed strange behavior',
      Neta: gameState.killer === 'Neta' ? 
        'Used pregnancy as cover' :
        'Noticed unusual activities'
    },
    murderNight: {
      Rachel: gameState.killer === 'Rachel' ? 
        'Waited for dogs to sleep' :
        'Dogs were barking frantically',
      Rom: gameState.killer === 'Rom' ? 
        'Created distracting noise' :
        'Heard strange sounds',
      Ilan: gameState.killer === 'Ilan' ? 
        'Moved silently through house' :
        'Noticed movements nearby',
      Michal: gameState.killer === 'Michal' ? 
        'Pretended to be asleep' :
        'Woke up to noises',
      Neta: gameState.killer === 'Neta' ? 
        'Used pregnancy as excuse' :
        'Baby was restless'
    },
    dayAfter: {
      Rachel: gameState.killer === 'Rachel' ? 
        'Acted shocked, deflected suspicion' :
        'Noticed suspicious behavior',
      Rom: gameState.killer === 'Rom' ? 
        'Pointed out others\' tiredness' :
        'Observed unusual actions',
      Ilan: gameState.killer === 'Ilan' ? 
        'Suggested staying calm' :
        'Saw early morning activity',
      Michal: gameState.killer === 'Michal' ? 
        'Controlled the narrative' :
        'Found evidence of disturbance',
      Neta: gameState.killer === 'Neta' ? 
        'Claimed morning sickness' :
        'Noticed early movements'
    }
  };
  
  return timeline[period][character as keyof typeof timeline[typeof period]] || '';
}

function getCharacterBehaviorRules(character: string): JSX.Element[] {
  if (!gameState) return [];

  const isKiller = character === gameState.killer;
  
  const killerRules = [
    "Never directly reveal being the killer",
    "Maintain false alibi consistently",
    "Deflect when weapon or location mentioned",
    "Show subtle signs of stress",
    "Try to cast suspicion on others",
    "Defend alibi if challenged"
  ];

  const innocentRules = [
    "Share truthful observations",
    "Point out suspicious behavior",
    "Maintain consistent alibi",
    "Show genuine concern",
    "Note contradictions in stories",
    "Share relevant timeline details"
  ];

  const rules = isKiller ? killerRules : innocentRules;
  
  return rules.map((rule, index) => (
    <li key={index} className="text-sm">
      {rule}
    </li>
  ));
}

export default function GameScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const [activeCharacters, setActiveCharacters] = useState<string[]>([]);
  const [groupMode, setGroupMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [guessesLeft, setGuessesLeft] = useState(3);
  const [gameEnded, setGameEnded] = useState(false);
  const [endGameMessage, setEndGameMessage] = useState('');
  const [lastGuessResult, setLastGuessResult] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);
  const [accusationOpen, setAccusationOpen] = useState(false);
  const [accusedCharacter, setAccusedCharacter] = useState<string>('');
  const [startTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<string>("00:00");
  const [timerActive, setTimerActive] = useState(true);
  const [milliseconds, setMilliseconds] = useState<string>("000");
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [notesOpen, setNotesOpen] = useState(false);
  const [timelineClues, setTimelineClues] = useState<TimelineClue[]>([]);
  const [clueFilter, setClueFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionSource, setSelectionSource] = useState<string>('');
  const [addClueDialogOpen, setAddClueDialogOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<'before' | 'during' | 'after' | null>(null);
  const [showGameLogic, setShowGameLogic] = useState(false);
  const [butlerDialogOpen, setButlerDialogOpen] = useState(false);

  // Add state for character descriptions
  const [characterDescriptions] = useState({
    Rachel: "A vibrant and expressive grandmother whose humor shines through even in serious moments. Her love for her dogs and fascination with tigers frequently colors her conversations, making her a memorable presence in any room. Despite her playful demeanor, she's remarkably perceptive and protective of her family.",
    Rom: "An energetic and ambitious businessman who takes pride in his AI ventures and entrepreneurial spirit. As Omri's brother, he was often engaged in spirited debates about technology and business with his brother. His competitive nature and strong opinions make him a dynamic presence in family gatherings.",
    Ilan: "A thoughtful and reserved grandfather whose practical nature reflects in his careful choice of words. His time spent working in the barn gives him a unique perspective on the estate's daily rhythms. Though quiet, his observations of family matters often prove insightful.",
    Michal: "A warm and sociable mother whose love for her family shapes her every interaction. As Omri's wife, she brings a nurturing presence to the household while maintaining her own distinct personality. Her natural humor helps her connect easily with others in the family.",
    Neta: "A gentle and observant woman whose pregnancy adds an extra layer of sensitivity to her perspective. As Rom's wife, she's well-integrated into the family dynamics and notices the subtle interactions between relatives. Her caring nature makes her attentive to the well-being of those around her."
  });

  // Update relationship data
  const [characterRelationships] = useState<Record<string, CharacterRelationship>>({
    Rachel: {
      title: "Omri's Mother",
      relationships: {
        Omri: "Son",
        Rom: "Son",
        Ilan: "Husband",
        Michal: "Daughter-in-law",
        Neta: "Daughter-in-law"
      }
    },
    Rom: {
      title: "Omri's Brother",
      relationships: {
        Omri: "Brother",
        Rachel: "Mother",
        Ilan: "Father",
        Michal: "Sister-in-law",
        Neta: "Wife"
      }
    },
    Ilan: {
      title: "Omri's Father",
      relationships: {
        Omri: "Son",
        Rachel: "Wife",
        Rom: "Son",
        Michal: "Daughter-in-law",
        Neta: "Daughter-in-law"
      }
    },
    Michal: {
      title: "Omri's Wife",
      relationships: {
        Omri: "Husband",
        Rachel: "Mother-in-law",
        Rom: "Brother-in-law",
        Ilan: "Father-in-law",
        Neta: "Sister-in-law"
      }
    },
    Neta: {
      title: "Omri's Sister-in-law",
      relationships: {
        Omri: "Brother-in-law",
        Rachel: "Mother-in-law",
        Rom: "Husband",
        Ilan: "Father-in-law",
        Michal: "Sister-in-law"
      }
    }
  });

  // Load high scores on mount
  useEffect(() => {
    const savedScores = localStorage.getItem('murderMysteryHighScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  // Update timer every 100ms for more precision
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (timerActive) {
      intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const ms = elapsed % 1000;
        
        setElapsedTime(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
        setMilliseconds(ms.toString().padStart(3, '0'));
      }, 100);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerActive, startTime]);

  const saveHighScore = (time: number, correct: boolean) => {
    const newScore: HighScore = {
      time,
      date: new Date().toISOString(),
      correct
    };

    const newScores = [...highScores, newScore]
      .sort((a, b) => {
        // Only consider correct guesses for high scores
        if (a.correct && !b.correct) return -1;
        if (!a.correct && b.correct) return 1;
        return a.time - b.time;
      })
      .slice(0, 10); // Keep top 10 scores

    setHighScores(newScores);
    localStorage.setItem('murderMysteryHighScores', JSON.stringify(newScores));
  };

  // Add character to group discussion
  const addToGroup = (character: string) => {
    if (!activeCharacters.includes(character)) {
      setActiveCharacters(prev => [...prev, character]);
    }
  };

  // Remove character from group discussion
  const removeFromGroup = (character: string) => {
    setActiveCharacters(prev => prev.filter(c => c !== character));
  };

  const determineClueCategory = (clue: string): TimelineClue['category'] => {
    const lowerClue = clue.toLowerCase();
    
    // Weapon-related keywords and context
    const weaponKeywords = {
      direct: ['knife', 'book', 'shears', 'trophy', 'tea', 'poison', 'cup', 'blade', 'weapon'],
      contextual: ['stabbed', 'hit', 'struck', 'killed with', 'murdered with', 'used to', 'drank from']
    };
    
    // Location-related keywords and context
    const locationKeywords = {
      direct: ['kitchen', 'garden', 'study', 'living room', 'backyard', 'bedroom', 'bathroom', 'hallway'],
      contextual: ['found at', 'happened in', 'occurred in', 'died in', 'body was in', 'discovered in']
    };
    
    // Motive-related keywords and context
    const motiveKeywords = {
      direct: ['jealous', 'angry', 'revenge', 'hate', 'money', 'threatened', 'blackmail'],
      contextual: ['because', 'reason for', 'wanted to', 'planned to', 'intended to', 'motive']
    };
    
    // Alibi-related keywords and context
    const alibiKeywords = {
      direct: ['was with', 'saw them', 'together', 'witnessed', 'present'],
      contextual: ['at the time', 'during the', 'that night', 'can confirm', 'whereabouts']
    };

    // Evidence-related keywords
    const evidenceKeywords = {
      direct: ['blood', 'fingerprints', 'footprints', 'evidence', 'broken', 'torn', 'stained'],
      contextual: ['found', 'discovered', 'noticed', 'spotted', 'traces of', 'marks of']
    };

    // Helper function to check if clue contains any keywords from a category
    const matchesCategory = (keywords: { direct: string[], contextual: string[] }): boolean => {
      const hasDirectMatch = keywords.direct.some(word => 
        lowerClue.includes(word) || 
        lowerClue.split(' ').some(w => w === word)
      );
      
      const hasContextualMatch = keywords.contextual.some(phrase => 
        lowerClue.includes(phrase)
      );
      
      return hasDirectMatch || hasContextualMatch;
    };

    // Check matches with priority
    if (matchesCategory(weaponKeywords)) {
      return 'weapon';
    }
    
    if (matchesCategory(evidenceKeywords)) {
      return 'evidence';
    }
    
    if (matchesCategory(locationKeywords)) {
      return 'location';
    }
    
    if (matchesCategory(motiveKeywords)) {
      return 'motive';
    }
    
    if (matchesCategory(alibiKeywords)) {
      return 'alibi';
    }

    return 'general';
  };

  const determineClueTime = (clue: string): 'before' | 'during' | 'after' => {
    const lowerClue = clue.toLowerCase();
    
    // Time-specific phrases and context
    const timePatterns = {
      before: [
        'before the murder',
        'earlier that day',
        'the day before',
        'previous day',
        'yesterday',
        'prior to',
        'that morning',
        'earlier',
        'before it happened'
      ],
      during: [
        'during the murder',
        'at the time',
        'when it happened',
        'that moment',
        'while it occurred',
        'as it happened',
        'at the scene',
        'that night'
      ],
      after: [
        'after the murder',
        'next day',
        'following morning',
        'afterwards',
        'later found',
        'discovered later',
        'following day',
        'since then'
      ]
    };

    // Check for explicit time references first
    for (const [period, patterns] of Object.entries(timePatterns)) {
      if (patterns.some(pattern => lowerClue.includes(pattern))) {
        return period as 'before' | 'during' | 'after';
      }
    }

    // Context-based time inference
    if (lowerClue.includes('saw the body') || 
        lowerClue.includes('found') || 
        lowerClue.includes('discovered')) {
      return 'after';
    }

    if (lowerClue.includes('heard') || 
        lowerClue.includes('witnessed') || 
        lowerClue.includes('saw')) {
      return 'during';
    }

    if (lowerClue.includes('had been') || 
        lowerClue.includes('used to') || 
        lowerClue.includes('always')) {
      return 'before';
    }

    return 'during'; // Default case
  };

  const addClueToTimeline = (clue: string, source: string, category?: TimelineClue['category']) => {
    const newClue: TimelineClue = {
      id: Math.random().toString(36).substr(2, 9),
      time: selectedTime || determineClueTime(clue),
      content: clue,
      source,
      timestamp: Date.now(),
      category: category || determineClueCategory(clue),
      important: false
    };

    setTimelineClues(prev => [...prev, newClue]);
  };

  const toggleClueImportance = (clueId: string) => {
    setTimelineClues(prev => 
      prev.map(clue => 
        clue.id === clueId 
          ? { ...clue, important: !clue.important }
          : clue
      )
    );
  };

  const updateClueTime = (clueId: string, newTime: 'before' | 'during' | 'after') => {
    setTimelineClues(prev => 
      prev.map(clue => 
        clue.id === clueId 
          ? { ...clue, time: newTime }
          : clue
      )
    );
  };

  // Filter clues based on search and category
  const filteredClues = timelineClues.filter(clue => {
    const matchesSearch = clue.content.toLowerCase().includes(clueFilter.toLowerCase()) ||
                         clue.source.toLowerCase().includes(clueFilter.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || clue.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Modify handleSendMessage to capture clues
  const handleSendMessage = async (content: string) => {
    if (!activeCharacter && activeCharacters.length === 0) return;

    setIsLoading(true);
    const userMessage: Message = { role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const gameContext: GameContext = {
        revealedClues: Object.values(notes).flat(),
        accusationMade: guessesLeft < 3,
        currentPhase: gameEnded ? 'resolution' : guessesLeft < 3 ? 'accusation' : 'investigation',
        timelineProgress: {
          dayBefore: messages.some(m => m.content.toLowerCase().includes('day before')),
          murderNight: messages.some(m => m.content.toLowerCase().includes('murder night')),
          dayAfter: messages.some(m => m.content.toLowerCase().includes('day after'))
        }
      };

      if (groupMode && activeCharacters.length > 0) {
        for (const character of activeCharacters) {
          const response = await getGroupResponse(
            character,
            content,
            messages,
            gameContext
          );

          const characterMessage: Message = {
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
            character: character
          };

          setMessages(prev => [...prev, characterMessage]);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else if (activeCharacter) {
        const response = await getGroupResponse(
        activeCharacter,
        content,
        messages.filter(m => m.character === activeCharacter || m.role === 'user'),
        gameContext
      );

        const characterMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        character: activeCharacter
      };

        setMessages(prev => [...prev, characterMessage]);
      }
    } catch (error) {
      console.error('Error getting response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeAccusation = () => {
    if (guessesLeft > 0) {
      setAccusationOpen(true);
      setLastGuessResult(null);
    }
  };

  const handleAccusationSubmit = () => {
    if (!accusedCharacter || guessesLeft <= 0) return;

    const result = checkAccusation(accusedCharacter);
    const finalTime = Date.now() - startTime;
    
    if (result.correct) {
      setTimerActive(false);
      saveHighScore(finalTime, true);
      
      const minutes = Math.floor(finalTime / 60000);
      const seconds = Math.floor((finalTime % 60000) / 1000);
      const ms = finalTime % 1000;
      const timeMessage = `\n\nTime taken: ${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
      
      setEndGameMessage(result.explanation + timeMessage);
      setGameEnded(true);
      setLastGuessResult({
        correct: true,
        message: "Congratulations! You've found the killer!"
      });
    } else {
      setGuessesLeft(prev => prev - 1);
      setLastGuessResult({
        correct: false,
        message: `Wrong! You have ${guessesLeft - 1} guesses left.`
      });
      
      if (guessesLeft === 1) {
        setTimerActive(false);
        saveHighScore(finalTime, false);
        
        const minutes = Math.floor(finalTime / 60000);
        const seconds = Math.floor((finalTime % 60000) / 1000);
        const ms = finalTime % 1000;
        const timeMessage = `\n\nTime taken: ${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        
        setEndGameMessage(result.explanation + "\n\nGame Over! You're out of guesses." + timeMessage);
        setGameEnded(true);
      }
    }
  };

  // Add handler for text selection
  const handleTextSelection = (character: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
      setSelectionSource(character);
      setAddClueDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-purple-900/30 border-b border-purple-700/50 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white">{GAME_TITLE}</h1>
          <p className="text-sm text-purple-200/70">{GAME_INTRO}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Butler Button */}
          <Button
            onClick={() => setButlerDialogOpen(true)}
            className="flex items-center gap-2 bg-amber-800/80 hover:bg-amber-700/80 text-amber-100"
            title="Ask butler for factual information"
          >
            <FaUserTie className="text-lg" />
            Crime Scene Facts
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white"
                onClick={() => setNotesOpen(true)}
              >
                <FaStickyNote />
                Notes
                <Badge className="ml-2 bg-purple-900/50">
                  {timelineClues.length}
                </Badge>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[1000px] bg-slate-900 border-purple-700/50 text-white">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-white">Investigation Notes</SheetTitle>
              </SheetHeader>
              
              <Tabs defaultValue="timeline" className="mt-4">
                <TabsList className="grid grid-cols-3 bg-slate-800">
                  <TabsTrigger value="timeline" className="flex items-center gap-2">
                    <FaClock />
                    Timeline
            </TabsTrigger>
                  <TabsTrigger value="suspects" className="flex items-center gap-2">
                    <FaBook />
                    Suspects
                  </TabsTrigger>
                  <TabsTrigger value="family-tree" className="flex items-center gap-2">
                    <FaUsers />
                    Family Tree
            </TabsTrigger>
          </TabsList>

                <TabsContent value="timeline" className="mt-4">
                  <div className="space-y-4">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" />
                      <Input
                        placeholder="Search clues..."
                        value={clueFilter}
                        onChange={(e) => setClueFilter(e.target.value)}
                        className="bg-slate-800 border-purple-500/30 pl-10"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-slate-800 border-purple-500/30">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="weapon">Weapon</SelectItem>
                        <SelectItem value="motive">Motive</SelectItem>
                        <SelectItem value="alibi">Alibi</SelectItem>
                        <SelectItem value="evidence">Evidence</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-6 space-y-8">
                    {['before', 'during', 'after'].map((timeframe) => (
                      <div key={timeframe} className="relative">
                        <div className="sticky top-0 bg-slate-900 z-10 py-2">
                          <h3 className="text-lg font-semibold capitalize text-purple-200">
                            {timeframe === 'before' ? 'Before the Murder' :
                             timeframe === 'during' ? 'During the Murder' :
                             'After the Murder'}
                          </h3>
                        </div>
                        <div className="space-y-4 mt-2">
                          {filteredClues
                            .filter(clue => clue.time === timeframe)
                            .sort((a, b) => b.timestamp - a.timestamp)
                            .map(clue => (
                              <div
                                key={clue.id}
                                className={`relative pl-4 border-l-2 ${
                                  clue.important 
                                    ? 'border-yellow-500/50' 
                                    : 'border-purple-500/30'
                                }`}
                              >
                                <div className="absolute -left-1.5 top-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    clue.important 
                                      ? 'bg-yellow-500 animate-pulse' 
                                      : 'bg-purple-500'
                                  }`} />
                                </div>
                                <div className={`bg-slate-800/50 rounded-lg p-3 ${
                                  clue.important ? 'ring-2 ring-yellow-500/30' : ''
                                }`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <Badge className={`
                                      ${clue.category === 'location' ? 'bg-blue-600' :
                                        clue.category === 'weapon' ? 'bg-red-600' :
                                        clue.category === 'motive' ? 'bg-green-600' :
                                        clue.category === 'alibi' ? 'bg-orange-600' :
                                        clue.category === 'relationship' ? 'bg-pink-600' :
                                        clue.category === 'evidence' ? 'bg-yellow-600' :
                                        'bg-purple-600'}
                                    `}>
                                      <FaTag className="mr-1" />
                                      {clue.category}
                        </Badge>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => toggleClueImportance(clue.id)}
                                        className="h-6 px-2 hover:bg-yellow-500/20 bg-transparent text-purple-200 hover:text-yellow-400"
                                      >
                                        {clue.important ? '★' : '☆'}
                                      </Button>
                                      <Select
                                        value={clue.time}
                                        onValueChange={(value) => updateClueTime(clue.id, value as 'before' | 'during' | 'after')}
                                      >
                                        <SelectTrigger className="h-6 px-2 bg-transparent border-none">
                                          <FaClock className="mr-1" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="before">Before</SelectItem>
                                          <SelectItem value="during">During</SelectItem>
                                          <SelectItem value="after">After</SelectItem>
                                        </SelectContent>
                                      </Select>
                    </div>
                                  </div>
                                  <p className="text-sm text-purple-100">{clue.content}</p>
                                  <div className="flex justify-between items-center mt-2 text-xs text-purple-300/70">
                                    <span>From: {clue.source}</span>
                                    <span>{new Date(clue.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
              ))}
            </div>
          </TabsContent>

                <TabsContent value="suspects" className="mt-4">
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-4 pr-4">
                      {Object.entries(characterDescriptions).map(([character, description]) => (
                        <div 
                  key={character}
                          className="bg-slate-800/50 rounded-lg p-4 space-y-2 hover:bg-slate-800/70 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-purple-200">
                            <FaUserSecret className="text-purple-400" />
                            <h3 className="text-lg font-semibold">{character}</h3>
                            <Badge className="ml-2 bg-purple-900/50">
                              {characterRelationships[character].title}
                            </Badge>
                          </div>
                          <p className="text-sm text-purple-100/80 leading-relaxed">
                            {description}
                          </p>
                          <div className="mt-4 border-t border-purple-500/20 pt-4">
                            <h4 className="text-sm font-semibold text-purple-200 mb-2">Family Relationships:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(characterRelationships[character].relationships).map(([relative, relation]) => (
                                <div 
                                  key={relative}
                                  className="flex items-center gap-2 text-sm bg-purple-900/20 rounded p-2"
                                >
                                  <FaUserSecret className="text-purple-400 text-xs" />
                                  <span className="text-purple-100">{relative}</span>
                                  <span className="text-purple-300/50 text-xs">({relation})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {timelineClues
                              .filter(clue => clue.source === character)
                              .length > 0 && (
                              <Badge className="bg-purple-600/50">
                                {timelineClues.filter(clue => clue.source === character).length} Clues
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
            </ScrollArea>
          </TabsContent>

                <TabsContent value="family-tree" className="mt-4">
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-8 pr-4 pb-8">
                      {/* Parents' Generation (Top) */}
                      <div className="relative">
                        <div className="grid grid-cols-2 gap-16">
                          <div className="flex flex-col items-center">
                            <div className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800/70 transition-colors">
                              <div className="flex items-center gap-2">
                                <FaUserSecret className="text-purple-400" />
                                <span className="font-semibold text-purple-200">Ilan</span>
                              </div>
                              <div className="text-xs text-purple-200/50 mt-1">Father</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800/70 transition-colors">
                              <div className="flex items-center gap-2">
                                <FaUserSecret className="text-purple-400" />
                                <span className="font-semibold text-purple-200">Rachel</span>
                              </div>
                              <div className="text-xs text-purple-200/50 mt-1">Mother</div>
                            </div>
                          </div>
                        </div>
                        {/* Marriage Line */}
                        <div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-purple-500/30" />
                        {/* Line down to children - adjust start position and length */}
                        <div className="absolute top-[50%] left-1/2 w-px h-[72px] bg-purple-500/30" />
                      </div>

                      {/* Children's Generation (Middle) */}
                      <div className="relative mt-12">
                        <div className="grid grid-cols-2 gap-16">
                          {/* Rom's Side */}
                          <div className="flex flex-col items-center">
                            <div className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800/70 transition-colors">
                              <div className="flex items-center gap-2">
                                <FaUserSecret className="text-purple-400" />
                                <span className="font-semibold text-purple-200">Rom</span>
                              </div>
                              <div className="text-xs text-purple-200/50 mt-1">Brother</div>
                            </div>
                            {/* Marriage Line */}
                            <div className="w-px h-8 bg-purple-500/30" />
                            <div className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800/70 transition-colors">
                              <div className="flex items-center gap-2">
                                <FaUserSecret className="text-purple-400" />
                                <span className="font-semibold text-purple-200">Neta</span>
                              </div>
                              <div className="text-xs text-purple-200/50 mt-1">Rom's Wife</div>
                            </div>
                          </div>

                          {/* Omri's Side */}
                          <div className="flex flex-col items-center">
                            <div className="bg-slate-800/50 rounded-lg p-3 border-2 border-red-500/50 hover:bg-slate-800/70 transition-colors">
                              <div className="flex items-center gap-2">
                                <FaSkull className="text-red-400" />
                                <span className="font-semibold text-red-200">Omri</span>
                                <span className="text-red-200/50">(Deceased)</span>
                              </div>
                              <div className="text-xs text-red-200/50 mt-1">Victim</div>
                            </div>
                            {/* Marriage Line */}
                            <div className="w-px h-8 bg-purple-500/30" />
                            <div className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-800/70 transition-colors">
                              <div className="flex items-center gap-2">
                                <FaUserSecret className="text-purple-400" />
                                <span className="font-semibold text-purple-200">Michal</span>
                              </div>
                              <div className="text-xs text-purple-200/50 mt-1">Omri's Wife</div>
                            </div>
                          </div>
                        </div>
                        {/* Sibling Connection Line - adjust position */}
                        <div className="absolute top-[23px] left-1/4 right-1/4 h-px bg-purple-500/30" />
                      </div>

                      {/* Additional Information */}
                      <div className="mt-8 bg-slate-800/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-purple-200 mb-2">Key Relationships:</h4>
                        <div className="space-y-2 text-sm text-purple-200/70">
                          <p>• Ilan & Rachel - Parents of Omri and Rom</p>
                          <p>• Rom & Neta - Married couple, Rom is Omri's brother</p>
                          <p>• Omri & Michal - Married couple</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-300 ${
            guessesLeft === 1 
              ? 'bg-red-900/30 text-red-200/70 animate-pulse'
              : guessesLeft === 2
                ? 'bg-yellow-900/30 text-yellow-200/70'
                : 'bg-purple-900/30 text-purple-200/70'
          }`}>
            <FaClock className={guessesLeft === 1 ? 'animate-spin' : 'animate-pulse'} />
            <span className="font-mono">{elapsedTime}</span>
            <span className="font-mono text-sm opacity-70">.{milliseconds}</span>
          </div>
          <div className="flex gap-2">
                  <Button 
              onClick={() => setGroupMode(true)}
              className={`flex items-center gap-2 ${
                groupMode 
                  ? "bg-purple-600 hover:bg-purple-500 text-white" 
                  : "bg-slate-700/50 hover:bg-slate-600/50 text-purple-100"
              }`}
            >
              <FaUsers />
              Group Mode
                  </Button>
            <Button
              onClick={() => {
                setGroupMode(false);
                setActiveCharacters([]);
              }}
              className={`flex items-center gap-2 ${
                !groupMode 
                  ? "bg-purple-600 hover:bg-purple-500 text-white" 
                  : "bg-slate-700/50 hover:bg-slate-600/50 text-purple-100"
              }`}
            >
              <FaUser />
              Individual Mode
            </Button>
              </div>
        </div>
      </div>

      {/* Character selection area with accusation button */}
      <div className="p-4 border-b border-purple-700/50 bg-purple-900/20 backdrop-blur-sm">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-purple-200/70 mb-2">
              {groupMode ? "Select characters for group discussion" : "Select a character to interrogate"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.keys(characters).filter(char => char !== "Omri").map((character) => (
                <div key={character} className="relative">
                  <Button
                    onClick={() => {
                      if (groupMode) {
                        if (activeCharacters.includes(character)) {
                          removeFromGroup(character);
                        } else {
                          addToGroup(character);
                        }
                      } else {
                        setActiveCharacter(character);
                        setActiveCharacters([]);
                      }
                    }}
                    className={`
                      relative flex items-center gap-2 transition-all duration-200
                      ${(groupMode && activeCharacters.includes(character)) ||
                        (!groupMode && activeCharacter === character)
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20 scale-105"
                        : "bg-slate-700/50 hover:bg-slate-600/50 text-purple-100"
                      }
                    `}
                  >
                    <FaUserSecret className={
                      (groupMode && activeCharacters.includes(character)) ||
                      (!groupMode && activeCharacter === character)
                        ? "text-purple-200"
                        : "text-purple-400"
                    } />
                    {character}
                  </Button>
                  {((groupMode && activeCharacters.includes(character)) ||
                    (!groupMode && activeCharacter === character)) && (
                <Badge
                      className="absolute -top-2 -right-2 bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                >
                      {groupMode ? "In Group" : "Active"}
                </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Button
              onClick={handleMakeAccusation}
              disabled={gameEnded || guessesLeft <= 0}
              className={`
                flex items-center gap-2 transition-all duration-200 min-w-[200px]
                ${gameEnded || guessesLeft <= 0
                  ? 'bg-slate-700/50 text-slate-400'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                }
              `}
            >
              <FaSkull className="animate-pulse" />
              Make Accusation
              <Badge className="ml-2 bg-purple-900/50">
                {guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} left
              </Badge>
            </Button>
            </div>
          </div>
        </div>
        
      {/* Messages display */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
            {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-purple-600/90 text-white'
                    : 'bg-slate-700/90 text-white'
                } rounded-lg shadow-lg shadow-purple-500/10 backdrop-blur-sm`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 border-b border-purple-400/20 px-4 py-2">
                    <FaUserSecret className="text-purple-400" />
                    <span className="font-semibold">{message.character}</span>
                  </div>
                )}
                <div
                  className="px-4 py-2 cursor-text"
                  onMouseUp={() => message.role === 'assistant' && handleTextSelection(message.character!)}
                >
                  {message.content}
                </div>
                <div className="text-xs text-purple-200/50 px-4 pb-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
            ))}
        </div>
        </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-purple-700/50 bg-purple-900/30 backdrop-blur-sm">
          <div className="flex gap-2">
          <input
            type="text"
              value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendMessage(inputValue);
              }
            }}
              placeholder={
              groupMode
                ? `Ask a question to the group (${activeCharacters.length} characters selected)...`
                : activeCharacter
                ? `Ask a question to ${activeCharacter}...`
                : "Select a character to begin interrogation..."
            }
            className="flex-1 p-2 rounded bg-slate-700/50 border border-purple-500/30 text-white placeholder:text-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            disabled={isLoading || (!activeCharacter && activeCharacters.length === 0)}
            />
            <Button 
            onClick={() => handleSendMessage(inputValue)}
            disabled={isLoading || !inputValue.trim() || (!activeCharacter && activeCharacters.length === 0)}
            className={`flex items-center gap-2 min-w-[100px] ${
              isLoading ? 'bg-purple-700/50' : 'bg-purple-600 hover:bg-purple-500'
            } text-white`}
            >
              {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Sending...
              </>
              ) : (
              <>
                Send
              </>
              )}
            </Button>
          </div>
        {groupMode && (
          <div className="mt-2 flex gap-2 items-center text-sm text-purple-200/70">
            <span>Active participants:</span>
            {activeCharacters.map(char => (
              <Badge key={char} className="bg-purple-700/50 text-purple-100">
                {char}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Accusation Dialog */}
      <Dialog open={accusationOpen} onOpenChange={setAccusationOpen}>
        <DialogContent className="bg-slate-900 border-purple-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Make Your Accusation</DialogTitle>
            <DialogDescription className="text-purple-200/70">
              Choose carefully! You have {guessesLeft} {guessesLeft === 1 ? 'guess' : 'guesses'} remaining.
            </DialogDescription>
          </DialogHeader>
          
          {lastGuessResult && (
            <div className={`p-4 rounded-lg ${
              lastGuessResult.correct
                ? 'bg-green-500/20 text-green-200'
                : 'bg-red-500/20 text-red-200'
            }`}>
                {lastGuessResult.message}
            </div>
          )}

          <RadioGroup 
            value={accusedCharacter} 
            onValueChange={setAccusedCharacter}
            className="space-y-2"
          >
            {Object.keys(characters).filter(char => char !== "Omri").map((character) => (
                <div 
                  key={character} 
                  className={`
                  flex items-center space-x-2 p-4 rounded-lg transition-all duration-200
                  ${accusedCharacter === character
                    ? 'bg-purple-600/20 shadow-lg shadow-purple-500/10'
                    : 'hover:bg-slate-800/50'
                  }
                  `}
                >
                  <RadioGroupItem value={character} id={character} />
                  <Label 
                    htmlFor={character} 
                  className="flex items-center gap-2 text-purple-100 cursor-pointer"
                  >
                  <FaUserSecret className="text-purple-400" />
                    {character}
                  </Label>
                </div>
              ))}
          </RadioGroup>
          
          <DialogFooter className="flex flex-col gap-4">
            <Button 
              onClick={handleAccusationSubmit} 
              disabled={!accusedCharacter}
              className={`
                w-full flex items-center justify-center gap-2
                ${!accusedCharacter
                  ? 'bg-slate-700/50 text-slate-400'
                  : 'bg-red-600 hover:bg-red-500 text-white'
                }
              `}
            >
              <FaSkull />
              Submit Final Accusation
            </Button>
            <p className="text-xs text-center text-purple-200/50">
              This action cannot be undone. Choose wisely.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Over Dialog */}
      <Dialog open={gameEnded}>
        <DialogContent className="bg-slate-900 border-purple-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {lastGuessResult?.correct ? "Congratulations!" : "Game Over"}
            </DialogTitle>
            <DialogDescription className="text-purple-200/70 whitespace-pre-line">
              {endGameMessage}
            </DialogDescription>
          </DialogHeader>
          
          {/* High Scores Section */}
          <div className="mt-4 border-t border-purple-700/30 pt-4">
            <h3 className="text-lg font-semibold mb-2">High Scores</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {highScores.map((score, index) => (
                <div 
                  key={index}
                  className={`flex justify-between items-center p-2 rounded ${
                    score.correct 
                      ? 'bg-green-900/20 text-green-200'
                      : 'bg-red-900/20 text-red-200'
                  }`}
                >
                  <span>
                    {new Date(score.date).toLocaleDateString()} -{' '}
                    {Math.floor(score.time / 60000)}:
                    {Math.floor((score.time % 60000) / 1000).toString().padStart(2, '0')}.
                    {(score.time % 1000).toString().padStart(3, '0')}
                  </span>
                  <Badge className={score.correct ? 'bg-green-700' : 'bg-red-700'}>
                    {score.correct ? 'Solved' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Game Logic Button */}
          <div className="mt-4 border-t border-purple-700/30 pt-4">
            <Button 
              onClick={() => setShowGameLogic(true)}
              className="w-full bg-purple-600 hover:bg-purple-500"
            >
              <FaCode className="mr-2" />
              Show Game Logic
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Logic Dialog */}
      <Dialog open={showGameLogic} onOpenChange={setShowGameLogic}>
        <DialogContent className="bg-slate-900 border-purple-700/50 text-white max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Game Logic</DialogTitle>
            <DialogDescription className="text-purple-200/70">
              Here's how the characters were behaving during this game:
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="mt-4 h-[60vh]">
            <div className="space-y-6">
              {/* Game State */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-purple-200">Game State</h3>
                <div className="bg-slate-800 p-4 rounded-lg space-y-2">
                  <p><span className="text-purple-400">Killer:</span> {gameState?.killer}</p>
                  <p><span className="text-purple-400">Weapon:</span> {gameState?.weapon}</p>
                  <p><span className="text-purple-400">Location:</span> {gameState?.location}</p>
                  <p><span className="text-purple-400">Time of Death:</span> {gameState?.timeOfDeath}</p>
                  <p><span className="text-purple-400">Motive:</span> {gameState?.motive}</p>
                </div>
              </div>

              {/* Character Alibis */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-purple-200">Character Alibis</h3>
                {Object.keys(characters).filter(char => char !== "Omri").map(character => (
                  <div key={character} className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-300 mb-2">{character}</h4>
                    <p className="text-sm">
                      {character === gameState?.killer ? (
                        <span className="text-red-400">
                          True Location: {gameState.location} during {gameState.timeOfDeath}<br/>
                          False Alibi: {getCharacterAlibi(character)}
                        </span>
                      ) : (
                        <span className="text-green-400">
                          {getCharacterAlibi(character)}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Timeline Knowledge */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-purple-200">Timeline Knowledge</h3>
                {Object.keys(characters).filter(char => char !== "Omri").map(character => (
                  <div key={character} className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-300 mb-2">{character}</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-purple-400">Day Before:</span><br/>{getCharacterTimeline(character, 'dayBefore')}</p>
                      <p><span className="text-purple-400">Murder Night:</span><br/>{getCharacterTimeline(character, 'murderNight')}</p>
                      <p><span className="text-purple-400">Day After:</span><br/>{getCharacterTimeline(character, 'dayAfter')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Patterns */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-purple-200">Character Response Patterns</h3>
                {Object.keys(characters).filter(char => char !== "Omri").map(character => (
                  <div key={character} className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-300 mb-2">{character}</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-purple-400">Personality:</span><br/>{characterPersonalities[character].traits}</p>
                      <p><span className="text-purple-400">Speaking Style:</span><br/>{characterPersonalities[character].style}</p>
                      {character === gameState?.killer && (
                        <p className="text-red-400">This character was the killer and was programmed to:</p>
                      )}
                      <ul className="list-disc list-inside space-y-1 text-purple-200/70">
                        {getCharacterBehaviorRules(character)}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          <div className="mt-4 border-t border-purple-700/30 pt-4">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 hover:bg-purple-500"
            >
            Play Again
          </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Clue Dialog */}
      <Dialog open={addClueDialogOpen} onOpenChange={setAddClueDialogOpen}>
        <DialogContent className="bg-slate-900 border-purple-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Clue</DialogTitle>
            <DialogDescription className="text-purple-200/70">
              Selected text from {selectionSource}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-800/50 p-4 rounded-lg">
            <p className="text-purple-100">{selectedText}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>When did this occur?</Label>
              <Select onValueChange={(value) => setSelectedTime(value as 'before' | 'during' | 'after')}>
                <SelectTrigger className="bg-slate-800 border-purple-500/30">
                  <SelectValue placeholder="Select timing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before the Murder</SelectItem>
                  <SelectItem value="during">During the Murder</SelectItem>
                  <SelectItem value="after">After the Murder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(value) => setSelectedCategory(value as TimelineClue['category'])}>
                <SelectTrigger className="bg-slate-800 border-purple-500/30">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="weapon">Weapon</SelectItem>
                  <SelectItem value="motive">Motive</SelectItem>
                  <SelectItem value="alibi">Alibi</SelectItem>
                  <SelectItem value="evidence">Evidence</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedText && selectedTime && selectedCategory) {
                  addClueToTimeline(selectedText, selectionSource, selectedCategory as TimelineClue['category']);
                  setAddClueDialogOpen(false);
                  setSelectedText('');
                  setSelectionSource('');
                  setSelectedTime(null);
                  setSelectedCategory('all'); // Reset category after adding
                }
              }}
              className="w-full bg-purple-600 hover:bg-purple-500"
            >
              Add Clue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Butler Dialog */}
      <Dialog open={butlerDialogOpen} onOpenChange={setButlerDialogOpen}>
        <DialogContent className="bg-slate-900 border-purple-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FaUserTie className="text-purple-400" />
              Butler's Report
            </DialogTitle>
            <DialogDescription className="text-purple-200/70">
              Here are the confirmed facts about the murder:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-slate-800 p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-900/50 rounded-lg">
                  <FaMapMarkerAlt className="text-purple-400 text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-200">Location</h3>
                  <p className="text-sm text-purple-100">The body was found in the {gameState?.location}.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-900/50 rounded-lg">
                  <FaSkull className="text-purple-400 text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-200">Murder Weapon</h3>
                  <p className="text-sm text-purple-100">The murder weapon was a {gameState?.weapon}.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-900/50 rounded-lg">
                  <FaClock className="text-purple-400 text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-200">Time of Death</h3>
                  <p className="text-sm text-purple-100">The murder occurred {gameState?.timeOfDeath}.</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-900/20 p-4 rounded-lg text-sm text-purple-200/70">
              These details have been confirmed by the crime scene investigation.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 