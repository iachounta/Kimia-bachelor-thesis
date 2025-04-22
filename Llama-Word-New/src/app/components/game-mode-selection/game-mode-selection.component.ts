import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-mode-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#6366f1">
            <path d="M12 2.5c-5.24 0-9.5 4.26-9.5 9.5s4.26 9.5 9.5 9.5 9.5-4.26 9.5-9.5-4.26-9.5-9.5-9.5zm0 18c-4.69 0-8.5-3.81-8.5-8.5s3.81-8.5 8.5-8.5 8.5 3.81 8.5 8.5-3.81 8.5-8.5 8.5z"/>
            <path d="M12 6.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 8c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
          </svg>
          <h1>Word Master</h1>
        </div>
        <p class="subtitle">Challenge the AI in this exciting word guessing game!</p>
      </div>

      <div class="mode-selection">
        <h2>Choose Game Mode</h2>
        <div class="buttons">
          <button class="ai-mode" (click)="selectMode('user-guesses')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.5c-5.24 0-9.5 4.26-9.5 9.5s4.26 9.5 9.5 9.5 9.5-4.26 9.5-9.5-4.26-9.5-9.5-9.5zm0 18c-4.69 0-8.5-3.81-8.5-8.5s3.81-8.5 8.5-8.5 8.5 3.81 8.5 8.5-3.81 8.5-8.5 8.5z"/>
              <path d="M12 6.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5z"/>
            </svg>
            AI Chooses Word
          </button>
          <button class="user-mode" (click)="selectMode('ai-guesses')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 7c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm6 5H6v-.99c.2-.72 3.3-2.01 6-2.01s5.8 1.29 6 2v1z"/>
            </svg>
            You Choose Word
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .header {
      margin-bottom: 4rem;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .subtitle {
      font-size: 1.25rem;
      color: #64748b;
      margin: 0;
    }

    .mode-selection h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
    }

    .buttons {
      display: flex;
      gap: 2rem;
      justify-content: center;
      max-width: 800px;
      margin: 0 auto;
    }

    button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
      font-size: 1.25rem;
      font-weight: 600;
      border-radius: 16px;
      transition: all 0.2s ease;
    }

    .ai-mode {
      background-color: #6366f1;
      color: white;
    }

    .ai-mode:hover {
      background-color: #4f46e5;
    }

    .user-mode {
      background-color: #3b82f6;
      color: white;
    }

    .user-mode:hover {
      background-color: #2563eb;
    }

    svg {
      width: 24px;
      height: 24px;
    }
  `]
})
export class GameModeSelectionComponent {
  constructor(private router: Router) {}

  selectMode(mode: string) {
    this.router.navigate([mode]);
  }
}