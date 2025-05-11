import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes, RouterOutlet } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { GameModeSelectionComponent } from './app/components/game-mode-selection/game-mode-selection.component';
import { UserGuessesComponent } from './app/components/user-guesses/user-guesses.component';
import { AiGuessesComponent } from './app/components/ai-guesses/ai-guesses.component';
import { WinnerComponent } from './app/components/winner/winner.component';

const routes: Routes = [
  { path: '', component: GameModeSelectionComponent },
  { path: 'user-guesses', component: UserGuessesComponent },
  { path: 'ai-guesses', component: AiGuessesComponent },
  { path: 'winner', component: WinnerComponent }
];

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  standalone: true,
  imports: [RouterOutlet, GameModeSelectionComponent]
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
});