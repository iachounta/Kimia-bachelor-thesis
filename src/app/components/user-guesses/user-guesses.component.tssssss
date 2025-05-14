import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { GameHeaderComponent } from '../shared/game-header/game-header.component';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-user-guesses',
  standalone: true,
  imports: [CommonModule, FormsModule, GameHeaderComponent],
  template: `
    <div class="container">
    <app-game-header
  [username]="username"
  [round]="roundNumber"
  [difficulty]="currentDifficulty"
  [correctAnswers]="correctAnswers"
  [wrongAnswers]="wrongAnswers"
  [userTimeLeft]="timeLeft"
  [aiTimeLeft]="aiTimeLeft"
/>

  <!-- Category selection -->
  <div *ngIf="!categorySelected && !gameOver" class="category-select">
    <label style="font-weight: bold; font-size: 1.2rem;">Select a category to start:</label>
    <ul>
      <li
        *ngFor="let category of categories"
        (click)="selectCategory(category)"
        [ngClass]="{ 'category-done': categoryUsage[category] === 3 }"
      >
        {{ category }} ({{ 3 - categoryUsage[category] }} left)
      </li>
    </ul>
  </div>
  <div *ngIf="isLoading" class="ai-loading">
  <span class="spinner"></span> Give me a minute, I'm thinking...
</div>
  <!-- Word description -->
  <div *ngIf="categorySelected && !gameOver" class="description">
    {{ description }}
  </div>

  <!-- Guess input -->
  <div *ngIf="categorySelected && !gameOver" class="guess-input">
    <input [(ngModel)]="userGuess" placeholder="Enter your guess" (keyup.enter)="submitGuess()">
  </div>

  <!-- Buttons -->
  <div *ngIf="categorySelected && !gameOver" class="button-row">
    <button class="submit-button" (click)="submitGuess()">Submit Guess</button>
    <button class="hint-button" (click)="getHint()" [disabled]="hints.length >= 3" title="Up to 3 hints. Each costs 5 seconds.">
      Get Hint (-5 seconds)
    </button>
  </div>

  <!-- Reveal button -->
  <div *ngIf="categorySelected && hints.length >= 3 && !gameOver" class="reveal-container">
    <button class="reveal-button" (click)="revealAnswer()">Reveal Word & Skip</button>
  </div>

  <!-- Hints -->
  <button *ngIf="wrongAnswers >= 2 && hintUsed < 3" (click)="getHint()" [disabled]="hintUsed >= 3" title="Up to 3 hints. Each costs 5 seconds">
  Get Hint (-5 seconds)
</button>

  <!-- Feedback -->
  <div *ngIf="feedback" class="feedback" [class.correct]="isCorrect">{{ feedback }}</div>

  <!-- Back button -->
  <div class="back-button">
    <button (click)="goBack()">Back to Start</button>
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
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #1e293b;
    }
      .username-banner {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #334155;
}
    .difficulty-select {
      margin-bottom: 1.5rem;
    }
    .difficulty-label {
      margin-bottom: 0.5rem;
      display: block;
    }
    .difficulty-controls {
      display: flex;
      gap: 1rem;
    }
      .ai-loading {
  display: flex;
  align-items: center;
  font-style: italic;
  color: #64748b;
  margin-bottom: 1rem;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #cbd5e1;
  border-top: 2px solid #0ea5e9;
  border-radius: 50%;
  margin-right: 0.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
    .difficulty-dropdown {
      padding: 0.5rem;
      border-radius: 8px;
      border: 1px solid #d1d5db;
    }
    .start-button {
      background-color: #6366f1;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
      .category-done {
  background-color: #d9f99d !important; /* light green */
  font-weight: bold;
}
    .difficulty-indicator, .timer, .answer-tracker {
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }
    .timer {
      color: #1d4ed8;
    }
    .category-select ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .category-select li {
      cursor: pointer;
      padding: 0.5rem;
      margin: 0.25rem 0;
      background: #f1f5f9;
      border-radius: 6px;
    }
    .description {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 12px;
      font-size: 1.1rem;
    }
    .guess-input input {
      width: 100%;
      padding: 0.5rem;
      border-radius: 8px;
      border: 1px solid #d1d5db;
    }
    .button-row {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    .submit-button, .hint-button {
      flex: 1;
      padding: 0.75rem;
      font-size: 1rem;
      border-radius: 8px;
      border: none;
      color: white;
      cursor: pointer;
    }
    .submit-button {
      background-color: #6366f1;
    }
    .hint-button {
      background-color: #3b82f6;
    }
    .reveal-container {
      text-align: center;
      margin-top: 1rem;
    }
    .reveal-button {
      background-color: #ef4444;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .hints .hint {
      background: #f1f5f9;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 0.5rem;
    }
    .feedback {
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      text-align: center;
      font-weight: 500;
      background: #fecaca;
      color: #dc2626;
    }
    .feedback.correct {
      background: #bbf7d0;
      color: #16a34a;
    }
    .back-button {
      margin-top: 2rem;
      text-align: center;
    }
    .back-button button {
      background: #f59e0b;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
    }
  `]
})

export class UserGuessesComponent implements OnInit {
  description = '';
  userGuess = '';
  correctWord = '';
  hints: string[] = [];
  feedback = '';
  isCorrect = false;

  categories = ['Animals', 'Food', 'Places', 'Cities'];
  selectedCategory = '';
  categorySelected = false;
  categoryUsage: { [key: string]: number } = {
    Animals: 0,
    Food: 0,
    Places: 0,
    Cities: 0,
  };
  isLoading = false;
  timeLeft = 60;
  aiTimeLeft = 60;
  timer: any;
  gameOver = false;
  username = localStorage.getItem('username') || 'Guest';
  correctAnswers = 0;
  wrongAnswers = 0;
  hintUsed = 0; // Track how many hints were used
  @Input() roundNumber: number = 1;
  @Output() roundCompleted = new EventEmitter<void>();
  currentDifficulty = 'easy';

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit() {}

  getCurrentDifficulty(round: number): string {
    if (round <= 6) return 'easy';
    if (round <= 12) return 'medium';
    return 'hard';
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timer);
        this.gameOver = true;
        this.feedback = '⏰ Time is up!';
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  selectCategory(category: string) {
    if (this.gameOver) return;
    if (this.categoryUsage[category] >= 3) {
      this.feedback = `You've used all 3 words in the "${category}" category.`;
      return;
    }

    this.selectedCategory = category;
    this.categorySelected = true;
    this.categoryUsage[category]++;

    if (this.categoryUsage[category] === 3) {
      this.playApplauseSound();
    }

    this.pauseTimer();
    this.startNewGame();
  }

  startNewGame() {
    this.description = '';
    this.timeLeft = 60;
    this.aiTimeLeft = 60;
  
    const currentDifficulty = this.getCurrentDifficulty(this.roundNumber);
    this.isLoading = true;
  
    this.gameService.startGame(currentDifficulty, this.selectedCategory).subscribe(response => {
      this.description = response.description;
      this.correctWord = response.answer;
      this.hints = [];
      this.feedback = '';
      this.isCorrect = false;
      this.isLoading = false;
      this.startTimer();
    });
  }

  submitGuess() {
    if (!this.userGuess.trim()) return;
    const guess = this.userGuess.trim().toLowerCase();
    const answer = this.correctWord.trim().toLowerCase();

    if (guess === answer) {
      this.correctAnswers++;
      this.playCorrectSound();
      this.timeLeft += 10;
      this.feedback = 'Correct! +10 seconds ⏱️';
      this.isCorrect = true;


      setTimeout(() => {
        this.categorySelected = false;
        this.selectedCategory = '';
        this.roundCompleted.emit();
      }, 1500);
    } else {
      this.wrongAnswers++;
      this.playWrongSound();
      this.timeLeft = Math.max(0, this.timeLeft - 10);
      this.feedback = this.timeLeft === 0
        ? 'Game Over. ⏱️ -10 seconds!'
        : 'Wrong! Try again ⏱️ -10 seconds!';
    }

    this.userGuess = '';
  }

  getHint() {
    if (this.hintUsed < 3) {
      this.hintUsed++;
      // Logic for showing hint
      // Update score and give feedback if necessary
    } else {
      this.revealAnswer();
    }
  }

  revealAnswer() {
    if (this.hintUsed >= 3) {
      this.feedback = `The correct word was: ${this.correctWord}`;
    } else {
      this.feedback = 'Incorrect! Try again or get a hint.';
    }
  
    // Emit the event to notify the parent that the round is over
    this.roundCompleted.emit();
  
    // End round or skip to the next word
    this.categorySelected = false;
    this.selectedCategory = '';
  }

  checkIfGameWon() {
    if (this.roundNumber > 18) {
      this.playApplauseSound();
      this.playWinSound();
      this.router.navigate(['/winner']);
    }
  }

  playCorrectSound() { this.playAudio('correct-sound'); }
  playWrongSound() { this.playAudio('wrong-sound'); }
  playApplauseSound() { this.playAudio('applause-sound'); }
  playWinSound() { this.playAudio('win-sound'); }
  playGameOverSound() { this.playAudio('game-over-sound'); }

  playAudio(id: string) {
    const sound = document.getElementById(id) as HTMLAudioElement;
    if (sound) sound.play();
  }

  goBack() {
    window.location.href = '/';
  }
}