const game = new GameStateManager();

// Add a clue to the notebook
game.addNotebookEntry({
  id: 'note_1',
  type: 'CLUE',
  title: 'Wine Glass Location',
  content: 'Broken wine glass found in study, but butler claims dinner was served in dining room',
  relatedEvidence: ['broken_glass'],
  relatedCharacters: ['butler_01'],
  timestamp: '10:30',
  tags: ['contradiction', 'dining', 'butler'],
  isTheory: false
});

// Add a deduction
game.addNotebookEntry({
  id: 'deduction_1',
  type: 'DEDUCTION',
  title: 'Butler\'s Movement',
  content: 'Butler must have gone to study after dinner service - timeline doesn\'t match his testimony',
  relatedCharacters: ['butler_01'],
  timestamp: '11:00',
  tags: ['timeline', 'butler', 'suspicious'],
  isTheory: true
});

// Create a connection between entries
const connection: Connection = {
  id: 'conn_1',
  fromId: 'note_1',
  toId: 'deduction_1',
  type: ConnectionType.SUGGESTS,
  notes: 'Physical evidence contradicts butler\'s testimony',
  strength: 2
};

game.notebookManager.createConnection(connection); 