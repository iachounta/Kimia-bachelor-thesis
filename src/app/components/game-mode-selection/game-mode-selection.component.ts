import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-game-mode-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-mode-selection.component.html',
  styleUrls: ['./game-mode-selection.component.css']
})
export class GameModeSelectionComponent {
  constructor(private router: Router) {}

  startGame() {
    this.router.navigate(['/game']);
  }
}