import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-winner',
  imports: [],
  templateUrl: './winner.component.html',
  styleUrl: './winner.component.css'
})
export class WinnerComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']);
  }
}
