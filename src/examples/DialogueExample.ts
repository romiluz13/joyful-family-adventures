const game = new GameStateManager();

// Start conversation with butler
const startDialogue = game.performAction({
  type: 'talk',
  target: 'butler_01'
});
console.log(startDialogue.message);

// Player chooses an option
if (startDialogue.dialogueOptions) {
  const response = game.performAction({
    type: 'talk',
    target: 'butler_01',
    parameters: {
      optionId: 'ask_whereabouts'
    }
  });
  console.log(response.message);
}

// Show evidence during conversation
const evidenceResponse = game.performAction({
  type: 'talk',
  target: 'butler_01',
  parameters: {
    optionId: 'show_glass',
    evidence: ['broken_glass']
  }
});
console.log(evidenceResponse.message); 