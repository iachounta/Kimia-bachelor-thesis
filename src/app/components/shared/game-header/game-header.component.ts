import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-header.component.html',
  styleUrls: ['./game-header.component.css']
})
export class GameHeaderComponent {
  @Input() username: string = '';
  @Input() round: number = 1;
  @Input() difficulty: string = '';
  @Input() correctAnswers: number = 0;
  @Input() wrongAnswers: number = 0;
  @Input() userTimeLeft: number = 0;
  @Input() aiTimeLeft: number = 0;
}