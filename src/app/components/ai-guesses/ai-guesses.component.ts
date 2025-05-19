import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { GameService } from "../../services/game.service";
import { GameHeaderComponent } from "../shared/game-header/game-header.component";
import { LoggingService } from "../../services/logging.service";

@Component({
  selector: "app-ai-guesses",
  standalone: true,
  imports: [CommonModule, FormsModule, GameHeaderComponent],
  templateUrl: "./ai-guesses.component.html",
  styleUrls: ["./ai-guesses.component.css"],
})
export class AiGuessesComponent {
  selectedCategory: string = "Animal"; // Placeholder, can be dynamically set
  fetchWordForUserToDescribe(): void {
    this.gameService
      .fetchWord({
        category: this.selectedCategory,
        difficulty: this.currentDifficulty,
      })
      .subscribe((response) => {
        this.correctWord = response.word;
      });
  }
  userDescription = "";
  userHint = "";
  aiGuess = "";
  score = 6;
  feedback = "";
  timer: any;
  showHintInput = false;
  username = localStorage.getItem("username") || "Guest";
  @Input() roundNumber: number = 1;
  @Input() currentDifficulty = "";
  correctAnswers = 0;
  wrongGuesses = 0;
  hintUsed = 0;
  @Input() userGuessTimeLeft = 60;
  @Input() aiGuessTimeLeft = 60;
  correctWord = "";
  @Output() timerChanged = new EventEmitter<{
    userGuessTimeDiff?: number;
    aiGuessTimeDiff?: number;
  }>();
  gameOver = false;
  constructor(
    private gameService: GameService,
    private loggingService: LoggingService
  ) {}

  ngOnInit() {
    this.fetchWordForUserToDescribe();
  }

  submitDescription() {
    this.startTimer();
    if (!this.userDescription.trim()) {
      return;
    }
    this.loggingService.logEvent("aiGuessRoundStarted", {
      roundNumber: this.roundNumber,
      difficulty: this.currentDifficulty,
      description: this.userDescription,
      phase: "ai-guess",
    });
    this.gameService.makeGuess(this.userDescription).subscribe((response) => {
      this.aiGuess = response.guess;
      this.showHintInput = false;
      this.feedback = "";
      this.loggingService.logEvent("aiGuessMade", {
        guess: response.guess,
        roundNumber: this.roundNumber,
        difficulty: this.currentDifficulty,
        timeTaken: 60 - this.aiGuessTimeLeft,
        phase: "ai-guess",
      });
      this.pauseTimer();
    });
  }

  handleFeedback(isCorrect: boolean) {
    if (isCorrect) {
      this.loggingService.logEvent("aiGuessFeedback", {
        isCorrect: true,
        roundNumber: this.roundNumber,
        difficulty: this.currentDifficulty,
        phase: "ai-guess",
      });
      this.feedback = "Correct! The AI got it!";
      this.score += 2;
      this.aiGuess = "";
      this.userDescription = "";
      this.showHintInput = false;
    } else {
      this.loggingService.logEvent("aiGuessFeedback", {
        isCorrect: false,
        roundNumber: this.roundNumber,
        difficulty: this.currentDifficulty,
        wrongGuessCount: this.wrongGuesses,
        phase: "ai-guess",
      });
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
    this.loggingService.logEvent("hintProvidedByUser", {
      hintNumber: this.hintUsed,
      roundNumber: this.roundNumber,
      difficulty: this.currentDifficulty,
      phase: "ai-guess",
      hint: this.userHint,
    });
    this.aiGuess += " " + this.userHint;
    this.userHint = "";
    this.showHintInput = false;
    this.submitDescription();
  }

  goBack() {
    window.location.href = "/";
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    console.log("Time left:", this.aiGuessTimeLeft);

    this.timer = setInterval(() => {
      if (this.aiGuessTimeLeft > 0) {
        console.log("Time left:", this.aiGuessTimeLeft);
        this.timerChanged.emit({ userGuessTimeDiff: -1 });
      } else {
        clearInterval(this.timer);
        this.gameOver = true;
        this.feedback = "⏰ Time is up!";
        this.loggingService.logEvent("aiGuessTimeout", {
          roundNumber: this.roundNumber,
          difficulty: this.currentDifficulty,
          phase: "ai-guess",
        });
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
