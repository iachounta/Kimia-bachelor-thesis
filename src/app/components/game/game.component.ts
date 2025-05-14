import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserGuessesComponent } from '../user-guesses/user-guesses.component';
import { AiGuessesComponent } from '../ai-guesses/ai-guesses.component'; // Add this import

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, UserGuessesComponent, AiGuessesComponent], // Include AiGuessesComponent here
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  roundNumber = 1;

  get currentDifficulty(): string {
    if (this.roundNumber <= 6) return 'easy';
    if (this.roundNumber <= 12) return 'medium';
    return 'hard';
  }

  get isUserTurn(): boolean {
    return (this.roundNumber - 1) % 6 < 3; // First 3 rounds of each block = user describes
  }

  nextRound() {
    if (this.roundNumber < 18) {
      this.roundNumber++;
    } else {
      // route to winner or summary screen
    }
  }
}