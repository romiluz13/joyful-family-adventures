import { Game } from './Game';

async function main() {
  const game = new Game();
  await game.start();
}

main().catch(error => {
  console.error('An error occurred:', error);
  process.exit(1);
}); 