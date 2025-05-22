import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { UserGuessesComponent } from "../user-guesses/user-guesses.component";
import { AiGuessesComponent } from "../ai-guesses/ai-guesses.component"; // Add this import
import { LoggingService } from "../../services/logging.service";
import { GameService } from "../../services/game.service";

@Component({
  selector: "app-game",
  standalone: true,
  imports: [CommonModule, UserGuessesComponent, AiGuessesComponent], // Include AiGuessesComponent here
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent {
  constructor(
    private loggingService: LoggingService,
    private router: Router,
    public gameService: GameService
  ) {
    this.currentAICategory = this.getRandomCategory();
  }
  userGuessTimeLeft = 60;
  aiGuessTimeLeft = 60;

  userGuessCategoryUsage: { [key: string]: number } = {
    animal: 0,
    food: 0,
    place: 0,
  };

  aiGuessCategoryUsage: { [key: string]: number } = {
    animal: 0,
    food: 0,
    place: 0,
  };

  currentAICategory: string;

  CATEGORY_LIMIT = 3;

  roundNumber = 1;

  get currentDifficulty(): string {
    if (this.roundNumber <= 6) return "easy";
    if (this.roundNumber <= 12) return "medium";
    return "hard";
  }

  get isUserGuess(): boolean {
    return (this.roundNumber - 1) % 6 < 3; // First 3 rounds of each block = user describes
  }

  nextRound() {
    if (this.roundNumber < 18) {
      this.roundNumber++;
      if (!this.isUserGuess) this.currentAICategory = this.getRandomCategory();
    } else {
      this.loggingService.logEvent("gameFinished", {
        totalRounds: this.roundNumber,
        timestamp: new Date().toISOString(),
      });
      this.playWinSound();
      this.playApplauseSound();
      // You might want to route here if using Angular Router, for example:
      // this.router.navigate(["/winner"]);
    }
  }
  getRandomCategory(): string {
    const categories = Object.keys(this.aiGuessCategoryUsage);
    const availableCategories = categories.filter(
      (category) => this.aiGuessCategoryUsage[category] < this.CATEGORY_LIMIT
    );
    if (availableCategories.length === 0) {
      throw new Error("No available categories left for AI to guess.");
      return "";
    }
    const randomIndex = Math.floor(Math.random() * availableCategories.length);
    const selectedCategory = availableCategories[randomIndex];
    this.aiGuessCategoryUsage[selectedCategory]++; // Increment user guess usage
    return selectedCategory;
  }

  onTimerChanged(event: {
    userGuessTimeDiff?: number;
    aiGuessTimeDiff?: number;
  }): void {
    if (event.userGuessTimeDiff !== undefined) {
      this.userGuessTimeLeft = this.userGuessTimeLeft + event.userGuessTimeDiff;
      console.log("User guess time left:", this.userGuessTimeLeft);
      if (this.userGuessTimeLeft <= 0 && this.isUserGuess) {
        this.router.navigate(["/game-over"], {
          queryParams: { reason: "user-timeout" },
        });
        return;
      }
    }
    if (event.aiGuessTimeDiff !== undefined) {
      this.aiGuessTimeLeft = this.aiGuessTimeLeft + event.aiGuessTimeDiff;
      console.log("User guess time left:", this.userGuessTimeLeft);
      if (this.aiGuessTimeLeft <= 0 && !this.isUserGuess) {
        this.router.navigate(["/game-over"], {
          queryParams: { reason: "ai-timeout" },
        });
        return;
      }
    }
  }
  playWinSound() {
    const audio = new Audio("assets/sounds/win.wav");
    audio.play();
  }

  playApplauseSound() {
    const audio = new Audio("assets/sounds/applause.wav");
    audio.play();
  }
  onGameOver(): void {
    this.router.navigate(["/game-over"], {
      queryParams: { reason: "timeout" },
    });
  }
}
