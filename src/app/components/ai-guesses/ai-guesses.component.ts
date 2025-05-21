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
  isAiGuessCorrect = false;
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
  hintUsed = 0;
  @Input() userGuessTimeLeft = 60;
  @Input() aiGuessTimeLeft = 60;
  correctWord = "";
  @Output() timerChanged = new EventEmitter<{
    userGuessTimeDiff?: number;
    aiGuessTimeDiff?: number;
  }>();
  @Output() gameOverEvent = new EventEmitter<void>();
  gameOver = false;
  localWrongGuesses = 0;
  constructor(
    public gameService: GameService,
    private loggingService: LoggingService
  ) {}

  ngOnInit() {
    this.fetchWordForUserToDescribe();
  }

  submitDescription() {
    const wordCount = this.userDescription.trim().split(/\s+/).length;
    if (wordCount < 3) {
      this.feedback = "Please write at least 3 words in your description.";
      return;
    }
    this.startTimer();
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
      // Automatic correctness checking
      this.isAiGuessCorrect =
        this.aiGuess.toLowerCase().trim() ===
        this.correctWord.toLowerCase().trim();

      if (this.isAiGuessCorrect) {
        this.feedback = "✅ Correct!";
        this.gameService.aiStats.correct++;
        this.score += 2;
        setTimeout(() => {
          this.userDescription = "";
          this.aiGuess = "";
          this.feedback = "";
          this.isAiGuessCorrect = false;
          this.fetchWordForUserToDescribe();
        }, 3000);
      } else {
        this.feedback = "❌ Wrong. Try giving a hint!";
        this.gameService.aiStats.wrong++;
        this.localWrongGuesses++;
        this.score = Math.max(0, this.score - 1);
        if (this.localWrongGuesses >= 2 && this.hintUsed < 3) {
          this.showHintInput = true;
        }
        if (this.hintUsed >= 3) {
          this.feedback = `The correct word was: ${this.correctWord}`;
        }
      }
    });
  }

  // handleFeedback removed: now handled automatically in submitDescription

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
        this.timerChanged.emit({ aiGuessTimeDiff: -1 });
      } else {
        clearInterval(this.timer);
        this.gameOver = true;
        this.feedback = "⏰ Time is up!";
        this.loggingService.logEvent("aiGuessTimeout", {
          roundNumber: this.roundNumber,
          difficulty: this.currentDifficulty,
          phase: "ai-guess",
        });
        this.gameOverEvent.emit();
      }
    }, 1000);
  }

  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  handleSkip() {
    this.userGuessTimeLeft = Math.max(0, this.userGuessTimeLeft - 5);
    this.gameService.userStats.skipped++;
    this.loggingService.logEvent("userSkippedWord", {
      roundNumber: this.roundNumber,
      difficulty: this.currentDifficulty,
      phase: "ai-guess",
      reason: "user_clicked_skip",
    });
    this.fetchWordForUserToDescribe();
    this.userDescription = "";
    this.aiGuess = "";
    this.feedback = "";
  }
}
