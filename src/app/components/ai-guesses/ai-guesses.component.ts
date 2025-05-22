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
  @Input() currentCategory: string = "animal";
  isAiGuessCorrect = false;
  isThinking: boolean = false;
  isHintPhase: boolean = false;
  fetchWordForUserToDescribe(): void {
    this.gameService
      .fetchWord({
        category: this.currentCategory,
        difficulty: this.currentDifficulty,
      })
      .subscribe((response) => {
        this.correctWord = response.word;
      });
  }
  userDescription = "";
  userHint = "";
  aiGuess = "";
  feedback = "";
  timer: any;
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

    this.isThinking = true;
    const guessButton = document.querySelector(
      ".guess-button"
    ) as HTMLButtonElement;
    if (guessButton) {
      guessButton.classList.add("disabled");
    }
    this.isHintPhase = false;
    this.startTimer();
    this.loggingService.logEvent("aiGuessRoundStarted", {
      roundNumber: this.roundNumber,
      difficulty: this.currentDifficulty,
      description: this.userDescription,
      phase: "ai-guess",
    });

    this.makeAiGuess(this.userDescription);
  }

  makeAiGuess(input: string) {
    this.gameService.makeGuess(input).subscribe((response) => {
      this.aiGuess = response.guess;
      this.isThinking = false;
      const guessButton = document.querySelector(
        ".guess-button"
      ) as HTMLButtonElement;
      if (guessButton) {
        guessButton.classList.remove("disabled");
      }
      this.loggingService.logEvent("aiGuessMade", {
        guess: response.guess,
        roundNumber: this.roundNumber,
        difficulty: this.currentDifficulty,
        timeTaken: 60 - this.aiGuessTimeLeft,
        phase: "ai-guess",
      });

      this.pauseTimer();

      this.isAiGuessCorrect =
        response.guess.trim().toLowerCase() ===
        this.correctWord.trim().toLowerCase();

      if (this.isAiGuessCorrect) {
        this.feedback = "✅ Correct!";
        this.gameService.aiStats.correct++;
        setTimeout(() => {
          this.resetStateForNextWord();
        }, 3000);
      } else {
        this.feedback = "❌ Wrong. Try giving a hint!";

        this.localWrongGuesses++;
        if (this.localWrongGuesses === 2) {
          this.isHintPhase = true;
          this.feedback = "AI: I'm not sure. Can you give me a hint?";
        }
        this.gameService.aiStats.wrong++;

        if (this.hintUsed >= 3) {
          this.feedback = `The correct word was: ${this.correctWord}`;
        }
      }
    });
  }

  submitHint() {
    if (!this.userHint.trim()) return;

    this.hintUsed++;
    this.loggingService.logEvent("hintProvidedByUser", {
      hintNumber: this.hintUsed,
      roundNumber: this.roundNumber,
      difficulty: this.currentDifficulty,
      phase: "ai-guess",
      hint: this.userHint,
    });

    const enhancedInput = this.userDescription + " HINT: " + this.userHint;
    this.userHint = "";
    this.isHintPhase = false;

    this.makeAiGuess(enhancedInput);
  }

  resetStateForNextWord() {
    this.userDescription = "";
    this.aiGuess = "";
    this.feedback = "";
    this.isAiGuessCorrect = false;
    this.localWrongGuesses = 0;
    this.hintUsed = 0;
    this.isHintPhase = false;
    this.fetchWordForUserToDescribe();
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
