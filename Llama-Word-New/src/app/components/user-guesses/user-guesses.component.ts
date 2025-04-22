import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-user-guesses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Guess the Word!</h2>

      <!-- Difficulty selection -->
      <div *ngIf="!difficultySelected" class="difficulty-select">
        <label for="difficulty" class="difficulty-label">Select Difficulty:</label>
        <div class="difficulty-controls">
          <select id="difficulty" [(ngModel)]="selectedDifficulty" class="difficulty-dropdown">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button class="start-button" (click)="chooseDifficulty()">Start Game</button>
        </div>
      </div>

      <!-- Show selected difficulty -->
      <div *ngIf="difficultySelected" class="difficulty-indicator">
        Difficulty: <strong>{{ selectedDifficulty }}</strong>
      </div>

      <!-- Score -->
      <div *ngIf="difficultySelected" class="score">
        Score: {{ score }}
      </div>

      <!-- Word description -->
      <div *ngIf="difficultySelected" class="description">
        {{ description }}
      </div>

      <!-- Guess input -->
      <div *ngIf="difficultySelected" class="guess-input">
        <input [(ngModel)]="userGuess" placeholder="Enter your guess" (keyup.enter)="submitGuess()">
      </div>

      <!-- Buttons: Submit + Get Hint -->
      <div *ngIf="difficultySelected" class="button-row">
        <button class="submit-button" (click)="submitGuess()">Submit Guess</button>
        <button class="hint-button"
                (click)="getHint()"
                [disabled]="hints.length >= 3 || score <= 0">
          Get Hint (-1 point)
        </button>
      </div>

      <!-- Display hints -->
      <div *ngIf="hints.length" class="hints">
        <div *ngFor="let hint of hints" class="hint">
          {{ hint }}
        </div>
      </div>

      <!-- Feedback -->
      <div *ngIf="feedback" class="feedback" [class.correct]="isCorrect">
        {{ feedback }}
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .difficulty-select {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .difficulty-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #334155;
    }

    .difficulty-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .difficulty-dropdown {
      padding: 0.5rem;
      border-radius: 8px;
      border: 1px solid #d1d5db;
      font-size: 1rem;
    }

    .start-button {
      background-color: #6366f1;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
    }

    .start-button:hover {
      background-color: #4f46e5;
    }

    .difficulty-indicator {
      font-size: 1rem;
      color: #475569;
      margin-bottom: 0.5rem;
    }

    .score {
      font-size: 1.25rem;
      font-weight: 500;
      color: #6366f1;
      margin-bottom: 1rem;
    }

    .description {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      font-size: 1.125rem;
      line-height: 1.6;
    }

    .guess-input {
      display: flex;
      margin-bottom: 1rem;
    }

    .guess-input input {
      flex: 1;
      padding: 0.5rem;
      font-size: 1rem;
      border-radius: 8px;
      border: 1px solid #d1d5db;
    }

    .button-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .submit-button,
    .hint-button {
      flex: 1;
      padding: 0.75rem;
      font-size: 1rem;
      border-radius: 8px;
      border: none;
      color: white;
      cursor: pointer;
    }

    .submit-button {
      background: #6366f1;
    }

    .hint-button {
      background: #3b82f6;
    }

    .hint-button:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }

    .hints {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .hint {
      background: #f1f5f9;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1rem;
    }

    .feedback {
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      font-weight: 500;
      background: #fecaca;
      color: #dc2626;
    }

    .feedback.correct {
      background: #bbf7d0;
      color: #16a34a;
    }
  `]
})
export class UserGuessesComponent implements OnInit {
  description = '';
  userGuess = '';
  correctWord = '';
  hints: string[] = [];
  score = 6;
  feedback = '';
  isCorrect = false;
  selectedDifficulty = 'easy';
  difficultySelected = false;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    // Wait for user to select difficulty
  }

  chooseDifficulty() {
    this.difficultySelected = true;
    this.startNewGame();
  }

  startNewGame() {
    this.gameService.startGame(this.selectedDifficulty).subscribe(response => {
      this.description = response.description;
      this.correctWord = response.answer;
      this.hints = [];
      this.score = 6;
      this.feedback = '';
      this.isCorrect = false;
    });
  }

  submitGuess() {
    if (!this.userGuess.trim()) return;

    const guess = this.userGuess.trim().toLowerCase();
    const answer = this.correctWord.trim().toLowerCase();

    if (guess === answer) {
      this.feedback = 'Correct! Well done!';
      this.isCorrect = true;
      this.score += 2;
      setTimeout(() => this.startNewGame(), 2000);
    } else {
      this.score = Math.max(0, this.score - 1);
      this.feedback = this.score === 0 ? 'Game Over. AI won!' : 'Wrong guess, try again!';
      this.isCorrect = false;
    }

    this.userGuess = '';
  }

  getHint() {
    if (this.score > 0 && this.hints.length < 3) {
      this.gameService.getHint(this.correctWord).subscribe(response => {
        this.hints.push(response.hint);
        this.score--;
      });
    }
  }
}