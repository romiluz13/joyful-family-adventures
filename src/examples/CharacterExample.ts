const butler: Character = {
  id: 'butler_01',
  name: 'James Montgomery',
  role: 'Butler',
  testimony: [
    "I was serving dinner when I heard a loud crash from the study.",
    "I saw Mr. Peterson arguing with someone in the garden earlier that evening.",
    "The master's safe was still locked when I cleaned the study at 7 PM."
  ],
  secrets: [
    "I made a copy of the safe key three months ago.",
    "I owe Mr. Peterson a substantial gambling debt."
  ],
  isLying: [false, true, false],  // Second testimony is a lie
  relationships: new Map([
    ['peterson_01', {
      type: 'enemy',
      details: 'Holds gambling debt over the butler',
      trustLevel: 30
    }],
    ['maid_01', {
      type: 'friend',
      details: 'Long-time colleagues and confidants',
      trustLevel: 85
    }]
  ]),
  location: Location.DINING_ROOM,
  alibi: "I was serving dinner to the guests in the dining room at the time of the murder."
}; 