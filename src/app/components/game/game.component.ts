import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserGuessesComponent } from "../user-guesses/user-guesses.component";
import { AiGuessesComponent } from "../ai-guesses/ai-guesses.component"; // Add this import

@Component({
  selector: "app-game",
  standalone: true,
  imports: [CommonModule, UserGuessesComponent, AiGuessesComponent], // Include AiGuessesComponent here
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent {
  userGuessTimeLeft = 60;
  aiGuessTimeLeft = 60;
  categories: string[] = ["Animals", "Food", "Places"];

  userGuessCategoryUsage: { [key: string]: number } = {
    Animals: 0,
    Food: 0,
    Places: 0,
  };

  aiGuessCategoryUsage: { [key: string]: number } = {
    Animals: 0,
    Food: 0,
    Places: 0,
  };

  CATEGORY_LIMIT = 3;

  roundNumber = 4;

  get currentDifficulty(): string {
    if (this.roundNumber <= 6) return "easy";
    if (this.roundNumber <= 12) return "medium";
    return "hard";
  }

  get isUserTurn(): boolean {
    return (this.roundNumber - 1) % 6 < 3; // First 3 rounds of each block = user describes
  }

  nextRound() {
    if (this.roundNumber < 18) {
      this.roundNumber++;
    } else {
      // route to winner or summary screen
    }
  }

  onTimerChanged(event: {
    userGuessTimeDiff?: number;
    aiGuessTimeDiff?: number;
  }): void {
    console.log("Timer changed event:", event);
    if (event.userGuessTimeDiff !== undefined) {
      //TODO: Check time not negative
      this.userGuessTimeLeft = this.userGuessTimeLeft + event.userGuessTimeDiff;

      console.log("User guess time left:", this.userGuessTimeLeft);
    }
    if (event.aiGuessTimeDiff !== undefined) {
      this.aiGuessTimeLeft = this.aiGuessTimeLeft + event.aiGuessTimeDiff;
    }
  }
}
