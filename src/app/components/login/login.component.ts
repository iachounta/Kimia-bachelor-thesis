import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  username = "";

  constructor(private router: Router) {}

  startGame() {
    if (this.username.trim()) {
      localStorage.setItem("username", this.username.trim());
      this.router.navigate(["/game"]);
    }
  }
}
