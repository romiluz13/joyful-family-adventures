from typing import Dict, List, Optional
from random import choice
from models.characters import *

class GameLogic:
    def __init__(self):
        self.characters: Dict[str, CharacterBase] = {
            "Rachel": Rachel(),
            "Rom": Rom(),
            "Ilan": Ilan(),
            "Michal": Michal(),
            "Neta": Neta(),
            "Omri": Omri()
        }
        
        self.weapons = [
            "kitchen knife",
            "heavy book",
            "garden shears",
            "old trophy",
            "poisoned tea"
        ]
        
        self.locations = [
            "kitchen",
            "garden",
            "study room",
            "living room",
            "backyard"
        ]
        
        self.time_slots = [
            "just after dinner",
            "late at night",
            "early morning",
            "during afternoon tea",
            "before breakfast"
        ]
        
        self.motives = {
            "Rachel": [
                "Omri threatened to send her dogs to a shelter",
                "Omri was planning to sell the family house",
                "Omri discovered her gambling debts"
            ],
            "Rom": [
                "Omri was going to expose his failed startup",
                "Omri refused to invest in his new tech venture",
                "Omri threatened to reveal his internet scam"
            ],
            "Ilan": [
                "Omri discovered his secret second family",
                "Omri was going to change the will",
                "Omri found evidence of his past crimes"
            ],
            "Michal": [
                "Omri was about to reveal her affair",
                "Omri threatened to take away her inheritance",
                "Omri discovered her stolen family heirlooms"
            ],
            "Neta": [
                "Omri knew about her fake pregnancy",
                "Omri was going to expose her true identity",
                "Omri discovered she was stealing from the family"
            ]
        }
        
        self.game_state = self.initialize_game_state()

    def initialize_game_state(self) -> GameState:
        # Select killer (excluding Omri)
        possible_killers = list(self.characters.keys())
        possible_killers.remove("Omri")
        killer = choice(possible_killers)
        
        # Update character murderer status
        for name, character in self.characters.items():
            character.is_murderer = (name == killer)
        
        return GameState(
            current_killer=killer,
            weapon=choice(self.weapons),
            location=choice(self.locations),
            time_of_death=choice(self.time_slots),
            motive=choice(self.motives[killer]),
            clues_revealed=[],
            attempts_remaining=3
        )

    def get_character_response(self, character_name: str, user_message: str) -> str:
        character = self.characters.get(character_name)
        if not character:
            return "Character not found."
            
        # Generate response based on character's personality and game state
        if character.is_murderer:
            return self._generate_killer_response(character, user_message)
        return self._generate_innocent_response(character, user_message)

    def _generate_killer_response(self, character: CharacterBase, user_message: str) -> str:
        # Add nervous behavior and deflection when discussing murder
        message_lower = user_message.lower()
        if any(word in message_lower for word in ["murder", "kill", "weapon", self.game_state.weapon.lower()]):
            return f"{choice(character.typical_phrases)} {character.defense_mechanisms}"
        return choice(character.typical_phrases)

    def _generate_innocent_response(self, character: CharacterBase, user_message: str) -> str:
        # Provide helpful information while staying in character
        return f"{choice(character.typical_phrases)} {character.behavior}"

    def make_accusation(self, accused_character: str) -> tuple[bool, str]:
        if self.game_state.attempts_remaining <= 0:
            return False, "No more attempts remaining."
            
        self.game_state.attempts_remaining -= 1
        is_correct = accused_character == self.game_state.current_killer
        
        if is_correct:
            return True, f"Correct! {accused_character} killed Omri using the {self.game_state.weapon} in the {self.game_state.location} {self.game_state.time_of_death} because {self.game_state.motive}."
        
        return False, f"Wrong! You have {self.game_state.attempts_remaining} attempts remaining."

    def add_clue(self, clue: str) -> None:
        if clue not in self.game_state.clues_revealed:
            self.game_state.clues_revealed.append(clue)

    def get_character_timeline(self, character_name: str) -> Optional[Timeline]:
        character = self.characters.get(character_name)
        return character.timeline if character else None 