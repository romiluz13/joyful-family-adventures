import inquirer from 'inquirer';
import chalk from 'chalk';
import { GameStateManager } from './classes/GameStateManager';
import { PlayerAction, ActionResult } from './types';
import { Location } from './types/Character';

export class Game {
  private gameState: GameStateManager;

  constructor() {
    this.gameState = new GameStateManager();
  }

  public async start(): Promise<void> {
    console.clear();
    console.log(chalk.red.bold("\n=== Murder at Blackwood Manor ===\n"));
    console.log(chalk.yellow("You are Detective Shaw, called to investigate a murder at the prestigious Blackwood Manor."));
    console.log(chalk.yellow("The victim, Lord Blackwood, was found dead in his study late last night."));
    console.log(chalk.yellow("Time is of the essence. You have 5 days to solve the case.\n"));
    
    while (this.gameState.isGameActive()) {
      await this.gameLoop();
    }
  }

  private async gameLoop(): Promise<void> {
    const currentLocation = this.gameState.getCurrentLocation();
    const description = this.gameState.getLocationDescription();

    console.log(chalk.cyan("\n==================="));
    console.log(chalk.cyan.bold(`Location: ${currentLocation}`));
    console.log(chalk.white(description?.description));
    
    const action = await this.getPlayerInput();
    const result = this.gameState.performAction(action);
    
    this.displayResult(result);
  }

  private async getPlayerInput(): Promise<PlayerAction> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Move to another room', value: 'move' },
          { name: 'Search the area', value: 'search' },
          { name: 'Talk to someone', value: 'talk' },
          { name: 'Check notebook', value: 'notebook' },
          { name: 'Examine evidence', value: 'examine' }
        ]
      }
    ]);

    switch (action) {
      case 'move':
        return this.handleMoveInput();
      case 'search':
        return this.handleSearchInput();
      case 'talk':
        return this.handleTalkInput();
      case 'examine':
        return this.handleExamineInput();
      case 'notebook':
        return this.handleNotebookInput();
      default:
        throw new Error('Invalid action');
    }
  }

  private async handleMoveInput(): Promise<PlayerAction> {
    const availableRooms = this.gameState.getAvailableRooms();
    const { room } = await inquirer.prompt([
      {
        type: 'list',
        name: 'room',
        message: 'Where would you like to go?',
        choices: availableRooms.map(room => ({
          name: room,
          value: room
        }))
      }
    ]);
    return { type: 'move', target: room };
  }

  private async handleSearchInput(): Promise<PlayerAction> {
    const searchableAreas = this.gameState.getSearchableAreas();
    const { area } = await inquirer.prompt([
      {
        type: 'list',
        name: 'area',
        message: 'What would you like to search?',
        choices: searchableAreas.map(area => ({
          name: area.name,
          value: area.id
        }))
      }
    ]);
    return { type: 'search', target: area };
  }

  private displayResult(result: ActionResult): void {
    if (!result.success) {
      console.log(chalk.red(result.message));
      return;
    }

    console.log(chalk.green(result.message));
    
    if (result.discoveries) {
      result.discoveries.forEach(discovery => {
        if ('name' in discovery) {  // Evidence
          console.log(chalk.yellow(`\nFound Evidence: ${discovery.name}`));
          console.log(chalk.white(discovery.description));
        } else {  // TimelineEvent
          console.log(chalk.blue(`\nEvent: ${discovery.description}`));
        }
      });
    }

    if (result.dialogueOptions) {
      this.handleDialogue(result.dialogueOptions);
    }
  }

  private async handleTalkInput(): Promise<PlayerAction> {
    const availableCharacters = this.gameState.getAvailableCharacters();
    const { character } = await inquirer.prompt([
      {
        type: 'list',
        name: 'character',
        message: 'Who would you like to talk to?',
        choices: availableCharacters.map(char => ({
          name: char.name,
          value: char.id
        }))
      }
    ]);
    return { type: 'talk', target: character };
  }

  private async handleExamineInput(): Promise<PlayerAction> {
    const discoveredEvidence = this.gameState.getDiscoveredEvidence();
    const { evidence } = await inquirer.prompt([
      {
        type: 'list',
        name: 'evidence',
        message: 'What would you like to examine?',
        choices: discoveredEvidence.map(ev => ({
          name: ev.name,
          value: ev.id
        }))
      }
    ]);
    return { type: 'examine', target: evidence };
  }

  private async handleNotebookInput(): Promise<PlayerAction> {
    const { section } = await inquirer.prompt([
      {
        type: 'list',
        name: 'section',
        message: 'Which section would you like to review?',
        choices: [
          { name: 'Clues', value: 'clues' },
          { name: 'Suspects', value: 'suspects' },
          { name: 'Timeline', value: 'timeline' },
          { name: 'Deductions', value: 'deductions' }
        ]
      }
    ]);
    return { type: 'notebook', target: section };
  }

  private async handleDialogue(options: any[]): Promise<void> {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Choose your response:',
        choices: options.map((opt, index) => ({
          name: opt.text,
          value: index
        }))
      }
    ]);
    // Handle the dialogue choice
    const result = await this.gameState.handleDialogueChoice(choice);
    console.log(chalk.cyan(result.message));
  }
} 