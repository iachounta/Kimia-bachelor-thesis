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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="24" height="24" fill="currentColor">
  <path d="M320 64C156.3 64 64 208 64 256s92.3 192 256 192 256-144 256-192S483.7 64 320 64zM224 232a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm192 0a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
</svg>
          <h1 style="font-family: 'Orbitron', sans-serif; letter-spacing: 2px; text-transform: uppercase;">Word Master</h1>
        </div>
        <p class="subtitle">Challenge the AI in this exciting word guessing game!</p>
      </div>

      <div class="mode-selection">
        <h2 style="font-family: 'Orbitron', sans-serif; letter-spacing: 2px; text-transform: uppercase;">
  Choose Game Mode
</h2>
        <div class="buttons">
          <button class="ai-mode" (click)="selectMode('user-guesses')" title="The AI thinks of a word and gives you clues. Try to guess it!">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="24" height="24" fill="currentColor">
  <path d="M320 0c17.7 0 32 14.3 32 32v32h80c17.7 0 32 14.3 32 32v32h24c26.5 0 48 21.5 48 48v192c0 70.7-57.3 128-128 128H176c-70.7 0-128-57.3-128-128V176c0-26.5 21.5-48 48-48h24V96c0-17.7 14.3-32 32-32h80V32c0-17.7 14.3-32 32-32zM144 256a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm256 48a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
</svg>
            AI Chooses Word
          </button>
          <button class="user-mode" (click)="selectMode('ai-guesses')" title="You describe a word and the AI tries to guess it. See if it can get it right!">
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
          <button class="ai-mode" (click)="selectMode('user-guesses')" title="The AI thinks of a word and gives you clues. Try to guess it!">
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
          <button class="user-mode" (click)="selectMode('ai-guesses')" title="You describe a word and the AI tries to guess it. See if it can get it right!">
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