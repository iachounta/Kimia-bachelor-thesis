import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-ai-guesses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>AI Guesses Your Word</h2>
      
      <div class="description-input">
        <textarea [(ngModel)]="userDescription" 
                  placeholder="Describe your word for the AI to guess..."
                  rows="4"></textarea>
        <button (click)="submitDescription()">Let AI Guess</button>
      </div>

      <div *ngIf="aiGuess" class="ai-guess">
        AI's guess: <span class="guess">{{ aiGuess }}</span>
      </div>

      <div *ngIf="aiGuess" class="feedback-buttons">
        <button class="correct-btn" (click)="handleFeedback(true)">Correct!</button>
        <button class="hint-btn" (click)="handleFeedback(false)">Wrong, provide hint</button>
      </div>

      <div *ngIf="showHintInput" class="hint-input">
        <textarea [(ngModel)]="userHint" 
                  placeholder="Provide a hint for the AI..."
                  rows="2"></textarea>
        <button (click)="submitHint()">Submit Hint</button>
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
      margin-bottom: 2rem;
    }

    .description-input, .hint-input {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    textarea {
      resize: vertical;
      min-height: 100px;
      font-size: 1rem;
      line-height: 1.5;
    }

    button {
      background: #6366f1;
      color: white;
    }

    .ai-guess {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      font-size: 1.125rem;
    }

    .guess {
      font-weight: 600;
      color: #6366f1;
    }

    .feedback-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .correct-btn {
      background: #22c55e;
      flex: 1;
    }

    .hint-btn {
      background: #3b82f6;
      flex: 1;
    }

    .hint-input textarea {
      min-height: 80px;
    }
  `]
})
export class AiGuessesComponent {
  userDescription = '';
  userHint = '';
  aiGuess = '';
  showHintInput = false;

  constructor(private gameService: GameService) {}

  submitDescription() {
    if (!this.userDescription.trim()) return;
    
    this.gameService.makeGuess(this.userDescription).subscribe(response => {
      this.aiGuess = response.guess;
      this.showHintInput = false;
    });
  }

  handleFeedback(isCorrect: boolean) {
    if (isCorrect) {
      this.aiGuess = '';
      this.userDescription = '';
      this.showHintInput = false;
      alert('Great! The AI guessed correctly!');
    } else {
      this.showHintInput = true;
    }
  }

  submitHint() {
    if (!this.userHint.trim()) return;
    
    this.userDescription += ' ' + this.userHint;
    this.showHintInput = false;
    this.userHint = '';
    this.submitDescription();
  }
}