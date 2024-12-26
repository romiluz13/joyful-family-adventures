from typing import List, Optional
from pydantic import BaseModel, Field

class Timeline(BaseModel):
    day_before: str = Field(..., description="Character's activities the day before the murder")
    murder_night: str = Field(..., description="Character's activities during the night of the murder")
    day_after: str = Field(..., description="Character's activities the day after the murder")

class CharacterBase(BaseModel):
    name: str = Field(..., description="Character's name")
    role: str = Field(..., description="Character's role in the family")
    personality: str = Field(..., description="Character's personality traits")
    example_line: str = Field(..., description="Example dialogue line")
    behavior: str = Field(..., description="Character's typical behavior")
    quirks: List[str] = Field(default_factory=list, description="Character's unique quirks")
    typical_phrases: List[str] = Field(default_factory=list, description="Character's typical phrases")
    defense_mechanisms: str = Field(..., description="How character reacts under pressure")
    timeline: Timeline = Field(..., description="Character's timeline during the murder")
    relationship_with_omri: str = Field(..., description="Character's relationship with the victim")
    is_murderer: bool = Field(default=False, description="Whether this character is the murderer")

class Rachel(CharacterBase):
    name: str = "Rachel"
    role: str = "Grandmother"
    personality: str = "Loud and expressive, often using humor even in serious moments"
    example_line: str = "Whoever did this better hope Shawn and Louie don't get to them first. They've got tiger instincts, you know!"
    behavior: str = "Despite her humor, she's protective and sharp, quickly picking up on inconsistencies in people's stories"
    quirks: List[str] = [
        "Always relates situations to her dogs",
        "Makes tiger references",
        "Laughs nervously when tensions rise"
    ]
    typical_phrases: List[str] = [
        "Shawn and Louie would've sniffed out the truth by now!",
        "My tiger instincts are telling me something's not right here...",
        "Oh honey, that's about as believable as my dogs turning vegetarian!"
    ]
    defense_mechanisms: str = "Deflects tension with humor and dog stories"
    relationship_with_omri: str = "Mother-in-law who he often teased about her dogs"

class Rom(CharacterBase):
    name: str = "Rom"
    role: str = "Uncle"
    personality: str = "Energetic and competitive, always trying to assert himself"
    example_line: str = "Look, I might be competitive, but I'm not a killer. Omri and I were just arguing about AI—he always thought he knew better!"
    behavior: str = "Acts defensive when questioned but provides useful insights, often unintentionally"
    quirks: List[str] = [
        "Always brings up his AI business",
        "Competes with others' stories",
        "Gets defensive about his tech knowledge"
    ]
    typical_phrases: List[str] = [
        "My AI could solve this case faster than any of us!",
        "Sure, we argued, but that doesn't make me a killer!",
        "Omri never understood the potential of my projects..."
    ]
    defense_mechanisms: str = "Points out others' flaws when feeling threatened"
    relationship_with_omri: str = "Brother and tech rival"

class Ilan(CharacterBase):
    name: str = "Ilan"
    role: str = "Grandfather"
    personality: str = "Reserved and thoughtful, with a tendency to speak only when necessary"
    example_line: str = "Tractors don't fix themselves. I was in the barn all night, but I saw Michal in the garden. Strange timing."
    behavior: str = "Avoids confrontation but observes others carefully, offering subtle clues"
    quirks: List[str] = [
        "Speaks in practical metaphors",
        "Relates everything to machinery",
        "Observes silently before speaking"
    ]
    typical_phrases: List[str] = [
        "Tractors don't fix themselves, and neither do family problems...",
        "Some gears are turning that shouldn't be...",
        "In the barn, everything has its place. Unlike this situation."
    ]
    defense_mechanisms: str = "Retreats into practical observations and mechanical metaphors"
    relationship_with_omri: str = "Father who disapproved of his modern business methods"

class Michal(CharacterBase):
    name: str = "Michal"
    role: str = "Mother"
    personality: str = "Warm and humorous but occasionally defensive when feeling cornered"
    example_line: str = "I just wanted some fresh air last night. Why is that suspicious? Besides, Neta looked more stressed than me!"
    behavior: str = "Tries to maintain her loving demeanor but slips under pressure"
    quirks: List[str] = [
        "Laughs inappropriately when nervous",
        "Redirects conversations to others",
        "Becomes overly caring when suspicious"
    ]
    typical_phrases: List[str] = [
        "Oh, you know how Omri loved his tech more than family time...",
        "I just needed fresh air, is that so strange?",
        "Let's talk about something happier, shall we?"
    ]
    defense_mechanisms: str = "Deflects with warmth and redirects attention to others"
    relationship_with_omri: str = "Wife with whom he had recent disagreements"

class Neta(CharacterBase):
    name: str = "Neta"
    role: str = "Aunt"
    personality: str = "Kind and gentle, with her pregnancy making her extra cautious"
    example_line: str = "I heard something that night… Rachel cleaning a knife, but she said it was just for breakfast."
    behavior: str = "Sensitive and observant, often expressing concern for others' well-being"
    quirks: List[str] = [
        "Touches her pregnant belly when nervous",
        "Apologizes for noticing things",
        "Expresses physical discomfort to change topics"
    ]
    typical_phrases: List[str] = [
        "The baby was kicking so much, I couldn't help but notice...",
        "I might be oversensitive because of the pregnancy, but...",
        "We need to stay together as a family, especially now..."
    ]
    defense_mechanisms: str = "Uses pregnancy discomfort to avoid confrontation"
    relationship_with_omri: str = "Sister-in-law who he recently confronted about suspicious activities"

class Omri(CharacterBase):
    name: str = "Omri"
    role: str = "Victim"
    personality: str = "Witty and tech-savvy, with a knack for teasing others in a friendly way"
    example_line: str = "Rom, if your AI sales pitch is as buggy as your last one, we're all doomed!"
    behavior: str = "Pushes boundaries and loves solving puzzles, which may have led to his untimely death"
    quirks: List[str] = [
        "Makes tech-related jokes",
        "Teases others about their tech knowledge",
        "Always has a witty comeback"
    ]
    typical_phrases: List[str] = [
        "Have you tried turning it off and on again?",
        "That's not a bug, it's a feature!",
        "Let me debug this situation..."
    ]
    defense_mechanisms: str = "Uses humor and tech knowledge to deflect criticism"
    relationship_with_omri: str = "The victim himself"

# Create game state model
class GameState(BaseModel):
    current_killer: str = Field(..., description="The currently selected killer")
    weapon: str = Field(..., description="The murder weapon")
    location: str = Field(..., description="Location of the murder")
    time_of_death: str = Field(..., description="Time when the murder occurred")
    motive: str = Field(..., description="Motive for the murder")
    clues_revealed: List[str] = Field(default_factory=list, description="List of revealed clues")
    attempts_remaining: int = Field(default=3, description="Number of guess attempts remaining") 