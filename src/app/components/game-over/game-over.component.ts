import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GameService } from "../../services/game.service";
import { SoundService } from "../../services/sound.service";
import { LoggingService } from "../../services/logging.service";

@Component({
  selector: "app-game-over",
  templateUrl: "./game-over.component.html",
  styleUrls: ["./game-over.component.scss"],
})
export class GameOverComponent implements OnInit {
  reason: string | null = null;
  roundNumber: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public gameService: GameService,
    private soundService: SoundService,
    private loggingService: LoggingService
  ) {}

  ngOnInit(): void {
    this.reason = this.route.snapshot.queryParamMap.get("reason");
    this.roundNumber = Number(
      this.route.snapshot.queryParamMap.get("roundNumber")
    );
    this.soundService.playGameOver();
    this.loggingService.logEvent("gameOver", {
      reason: this.reason,
      userStats: this.gameService.userStats,
      aiStats: this.gameService.aiStats,
      //roundNumber: this.gameService.roundNumber, //TODO: what is the issue with this? mikham moghe game over round number biad hatman
      winner: this.reason === "ai-timeout" ? "user" : "ai",
      aiTimeLeft: this.gameService.aiGuessTimeLeft,
      userTimeLeft: this.gameService.userGuessTimeLeft,
      roundNumber: this.roundNumber,
    });
  }

  get message(): string {
    switch (this.reason) {
      case "user-timeout":
        return "⏰ Time's up! You lost this round.";
      case "ai-timeout":
        return "The AI ran out of time! You won!";
      default:
        return "Game over.";
    }
  }

  get title(): string {
    switch (this.reason) {
      case "ai-timeout":
        return "You Won!";
      default:
        return "Game Over";
    }
  }

  startGame() {
    this.loggingService.logEvent("playAgainClicked", {});
    this.gameService.resetGame();
    this.router.navigate(["/"]);
  }
}
