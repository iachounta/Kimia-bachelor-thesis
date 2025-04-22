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
      <div class="score">Score: {{ score }}</div>
      
      <div class="description">
        {{ description }}
      </div>

      <div class="guess-input">
        <input [(ngModel)]="userGuess" 
               placeholder="Enter your guess"
               (keyup.enter)="submitGuess()">
        <button (click)="submitGuess()">Submit Guess</button>
      </div>

      <button class="hint-button" 
              (click)="getHint()" 
              [disabled]="hints.length >= 3 || score <= 0">
        Get Hint (-1 point)
      </button>

      <div class="hints">
        <div *ngFor="let hint of hints" class="hint">
          {{ hint }}
        </div>
      </div>

      <div *ngIf="feedback" 
           class="feedback" 
           [class.correct]="isCorrect">
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
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .score {
      font-size: 1.25rem;
      font-weight: 500;
      color: #6366f1;
      margin-bottom: 1.5rem;
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
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .guess-input input {
      flex: 1;
    }

    .guess-input button {
      background: #6366f1;
      color: white;
      min-width: 120px;
    }

    .hint-button {
      width: 100%;
      background: #3b82f6;
      color: white;
      margin-bottom: 1rem;
    }

    .hint-button:disabled {
      background: #cbd5e1;
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
  score = 10;
  feedback = '';
  isCorrect = false;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.startNewGame();
  }

  startNewGame() {
    this.gameService.startGame().subscribe(response => {
      this.description = response.description;
      this.correctWord = response.answer;
      this.hints = [];
      this.score = 10;
      this.feedback = '';
      this.isCorrect = false;
    });
  }

  submitGuess() {
    if (!this.userGuess.trim()) return;
    
    if (this.userGuess.toLowerCase() === this.correctWord.toLowerCase()) {
      this.feedback = 'Correct! Well done!';
      this.isCorrect = true;
      setTimeout(() => this.startNewGame(), 2000);
    } else {
      this.feedback = 'Wrong guess, try again!';
      this.isCorrect = false;
      this.score = Math.max(0, this.score - 1);
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