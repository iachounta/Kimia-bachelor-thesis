import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { GameService } from "../../services/game.service";
import { GameHeaderComponent } from "../shared/game-header/game-header.component";

@Component({
  selector: "app-ai-guesses",
  standalone: true,
  imports: [CommonModule, FormsModule, GameHeaderComponent],
  templateUrl: "./ai-guesses.component.html",
  styleUrls: ["./ai-guesses.component.css"],
})
export class AiGuessesComponent {
  userDescription = "";
  userHint = "";
  aiGuess = "";
  score = 6;
  feedback = "";
  showHintInput = false;
  username = localStorage.getItem("username") || "Guest";
  @Input() roundNumber: number = 1;
  currentDifficulty = "easy";
  correctAnswers = 0;
  wrongGuesses = 0;
  hintUsed = 0;
  userTimeLeft = 60;
  aiTimeLeft = 60;
  correctWord = "";

  constructor(private gameService: GameService) {}

  submitDescription() {
    if (!this.userDescription.trim()) {
      return;
    }
    this.gameService.makeGuess(this.userDescription).subscribe((response) => {
      this.aiGuess = response.guess;
      this.showHintInput = false;
      this.feedback = "";
    });
  }

  handleFeedback(isCorrect: boolean) {
    if (isCorrect) {
      this.feedback = "Correct! The AI got it!";
      this.score += 2;
      this.aiGuess = "";
      this.userDescription = "";
      this.showHintInput = false;
    } else {
      this.wrongGuesses++;
      this.score = Math.max(0, this.score - 1);
      if (this.wrongGuesses >= 2 && this.hintUsed < 3) {
        this.feedback = "Wrong guess from the AI. Provide a hint.";
        this.showHintInput = true;
      }
      if (this.hintUsed >= 3) {
        this.feedback = `The correct word was: ${this.correctWord}`;
      }
    }
  }

  submitHint() {
    if (!this.userHint.trim()) {
      return;
    }
    this.hintUsed++;
    this.aiGuess += " " + this.userHint;
    this.userHint = "";
    this.showHintInput = false;
    this.submitDescription();
  }

  goBack() {
    window.location.href = "/";
  }
}
