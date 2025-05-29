import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GameService } from "../../services/game.service";
import { SoundService } from "../../services/sound.service";
import { LoggingService } from "../../services/logging.service";

@Component({
  selector: "app-game-win",
  templateUrl: "./winner.component.html",
  styleUrls: ["./winner.component.scss"],
})
export class WinnerComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public gameService: GameService,
    private soundService: SoundService,
    private loggingService: LoggingService
  ) {}

  ngOnInit(): void {
    this.soundService.playWin();
    this.loggingService.logEvent("gameWin", {
      withStats: this.gameService.userStats,
      winner: "user",
      aiTimeLeft: this.gameService.aiGuessTimeLeft,
      userTimeLeft: this.gameService.userGuessTimeLeft,
    });
  }

  get message(): string {
    return "🎉 Congratulations! You won the game!";
  }

  get title(): string {
    return "You Won!";
  }

  startGame() {
    this.loggingService.logEvent("playAgainClicked", {});
    this.gameService.resetGame();
    this.router.navigate(["/"]);
  }
}
