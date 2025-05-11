import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-guesses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Guess the Word!</h2>

      <!-- Difficulty selection -->
      <div *ngIf="!difficultySelected" class="difficulty-select">
        <label for="difficulty" class="difficulty-label">Select difficulty to start the game:</label>
        <div class="difficulty-controls">
          <select id="difficulty" [(ngModel)]="selectedDifficulty" class="difficulty-dropdown">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button class="start-button" (click)="chooseDifficulty()">Start Game</button>
        </div>
      </div>

      <!-- Show selected difficulty and stats -->
      <div *ngIf="difficultySelected" class="difficulty-indicator">
        Difficulty: <strong>{{ selectedDifficulty }}</strong>
      </div>

      <div *ngIf="difficultySelected" class="answer-tracker">
        ✅ Correct Answers: {{ correctAnswers }} | ❌ Wrong Answers: {{ wrongAnswers }}
      </div>

      <div *ngIf="difficultySelected && !gameOver" class="timer">
        ⏳ Time left: {{ timeLeft }} seconds
      </div>

      <!-- Category selection -->
      <div *ngIf="difficultySelected && !categorySelected && !gameOver" class="category-select">
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

      <!-- Word description -->
      <div *ngIf="difficultySelected && categorySelected && !gameOver" class="description">
        {{ description }}
      </div>

      <!-- Guess input -->
      <div *ngIf="difficultySelected && categorySelected && !gameOver" class="guess-input">
        <input [(ngModel)]="userGuess" placeholder="Enter your guess" (keyup.enter)="submitGuess()">
      </div>

      <!-- Buttons -->
      <div *ngIf="difficultySelected && categorySelected && !gameOver" class="button-row">
        <button class="submit-button" (click)="submitGuess()">Submit Guess</button>
        <button class="hint-button" (click)="getHint()" [disabled]="hints.length >= 3" title="Up to 3 hints. Each costs 5 seconds.">
          Get Hint (-5 seconds)
        </button>
      </div>

      <!-- Reveal button -->
      <div *ngIf="difficultySelected && categorySelected && hints.length >= 3 && !gameOver" class="reveal-container">
        <button class="reveal-button" (click)="revealAnswer()">Reveal Word & Skip</button>
      </div>

      <!-- Hints -->
      <div *ngIf="hints.length" class="hints">
        <div *ngFor="let hint of hints" class="hint">{{ hint }}</div>
      </div>

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
  selectedDifficulty = 'easy';
  difficultySelected = false;
  categories = ['Animals', 'Food', 'Places', 'Cities'];
  selectedCategory = '';
  categorySelected = false;
  categoryUsage: { [key: string]: number } = {
    Animals: 0,
    Objects: 0,
    Food: 0,
    Places: 0,
    Cities: 0
  };

  timeLeft = 150;
  timer: any;
  gameOver = false;

  correctAnswers = 0;
  wrongAnswers = 0;

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit() {}

  chooseDifficulty() {
    this.difficultySelected = true;
    this.categorySelected = false;
    this.selectedCategory = '';
    this.gameOver = false;
    this.timeLeft = 150;
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
      this.feedback = `You've used all 3 words in the "${category}" category. Choose another one.`;
      return;
    }
  
    this.selectedCategory = category;
    this.categorySelected = true;
    this.categoryUsage[category]++;
  
    // 🎉 Play applause when a category reaches 3
    if (this.categoryUsage[category] === 3) {
      this.playApplauseSound();
    }
  
    this.pauseTimer();
    this.startNewGame();
  }

  startNewGame() {
    this.description = '';
    this.gameService.startGame(this.selectedDifficulty, this.selectedCategory).subscribe(response => {
      this.description = response.description;
      this.correctWord = response.answer;
      this.hints = [];
      this.feedback = '';
      this.isCorrect = false;
      this.startTimer();
    });
  }
  checkIfGameWon(): void {
    const allDone = this.categories.every(category => this.categoryUsage[category] >= 3);
    if (allDone) {
      this.playApplauseSound();
      this.playWinSound();
      this.router.navigate(['/winner']); // redirect to winner page
    }
  }
  submitGuess() {
    if (!this.userGuess.trim()) return;
  
    const guess = this.userGuess.trim().toLowerCase();
    const answer = this.correctWord.trim().toLowerCase();
  
    if (guess === answer) {
      this.correctAnswers++;
      this.playCorrectSound(); //  play correct sound
      this.timeLeft += 10;
      this.feedback = 'Correct! Well done! ⏱️ +10 seconds!';
      this.isCorrect = true;
  
      setTimeout(() => {
        this.categorySelected = false;
        this.selectedCategory = '';
        this.startNewGame();
        this.checkIfGameWon(); //  call win check
      }, 1500);
  
    } else {
      this.wrongAnswers++; // increment wrong guesses
      this.playWrongSound(); //  play wrong sound
      this.timeLeft = Math.max(0, this.timeLeft - 10);
      this.feedback = this.timeLeft === 0
        ? 'Game Over. AI won! ⏱️ -10 seconds!'
        : 'Wrong guess, try again! ⏱️ -10 seconds!';
        if (this.timeLeft === 0) {
          this.playGameOverSound();
        }
      this.isCorrect = false;
    }
  
    this.userGuess = '';
  }

  getHint() {
    if (this.hints.length < 3) {
      this.gameService.getHint(this.correctWord).subscribe(response => {
        this.hints.push(response.hint);
        this.timeLeft = Math.max(0, this.timeLeft - 5);
        this.feedback = 'Hint used ⏱️ -5 seconds!';
      });
    }
  }

  revealAnswer() {
    this.feedback = 'The word was: ' + this.correctWord;
    this.isCorrect = false;
    this.categorySelected = false;
    this.selectedCategory = '';
  }
  playCorrectSound() {
    const sound = document.getElementById('correct-sound') as HTMLAudioElement;
    if (sound) sound.play();
  }
  
  playWrongSound() {
    const sound = document.getElementById('wrong-sound') as HTMLAudioElement;
    if (sound) sound.play();
  }
  
  playApplauseSound() {
    const sound = document.getElementById('applause-sound') as HTMLAudioElement;
    if (sound) sound.play();
  }
  playWinSound() {
    const sound = document.getElementById('win-sound') as HTMLAudioElement;
    if (sound) sound.play();
  }
  
  playGameOverSound() {
    const sound = document.getElementById('game-over-sound') as HTMLAudioElement;
    if (sound) sound.play();
  }
  
  goBack() {
    window.location.href = '/';
  }
}