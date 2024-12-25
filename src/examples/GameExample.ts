const game = new GameStateManager();

// Move to a new location
const moveResult = game.performAction({
  type: 'move',
  target: Location.STUDY
});
console.log(moveResult.message);

// Search an area
const searchResult = game.performAction({
  type: 'search',
  target: 'study_desk'
});

if (searchResult.success && searchResult.discoveries) {
  searchResult.discoveries.forEach(evidence => {
    console.log(`Found: ${evidence.name} - ${evidence.description}`);
  });
} 