import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-game-over",
  templateUrl: "./game-over.component.html",
  styleUrls: ["./game-over.component.css"],
})
export class GameOverComponent implements OnInit {
  reason: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.reason = this.route.snapshot.queryParamMap.get("reason");
  }

  get message(): string {
    switch (this.reason) {
      case "user-timeout":
        return "⏰ Time's up! You lost this round.";
      case "ai-timeout":
        return "🎉 The AI ran out of time! You win!";
      default:
        return "Game over.";
    }
  }

  startGame() {
    this.router.navigate(["/game"]);
  }
}
