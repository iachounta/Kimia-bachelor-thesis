import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { GameService } from "../../services/game.service";
import { GameHeaderComponent } from "../shared/game-header/game-header.component";
import { LoggingService } from "../../services/logging.service";
import { SoundService } from "../../services/sound.service";

@Component({
  selector: "app-ai-guesses",
  standalone: true,
  imports: [CommonModule, FormsModule, GameHeaderComponent],
  templateUrl: "./ai-guesses.component.html",
  styleUrls: ["./ai-guesses.component.scss"],
})
export class AiGuessesComponent {
  @Input() isAiGuessMode: boolean = false;
  @Input() currentCategory: string = "animal";
  isAiGuessCorrect = false;
  isThinking: boolean = false;
  isHintPhase: boolean = false;

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
  @Output() roundCompleted = new EventEmitter<void>();
  gameOver = false;
  localWrongGuesses = 0;

  constructor(
    public gameService: GameService,
    private loggingService: LoggingService,
    private soundService: SoundService
  ) {}

  ngOnInit() {
    this.fetchWordForUserToDescribe();
    this.logStartRound();
  }

  fetchWordForUserToDescribe(): void {
    this.isThinking = true;
    this.resetStateForNextWord();
    this.gameService
      .fetchWord({
        category: this.currentCategory,
        difficulty: this.currentDifficulty,
      })
      .subscribe((response) => {
        this.correctWord = response.word;
        console.log("Fetched word for user to describe:", this.correctWord);
        this.isThinking = false;
      });
  }

  submitDescription() {
    const wordCount = this.userDescription.trim().split(/\s+/).length;
    if (wordCount < 3) {
      this.feedback = "Please write at least 3 words in your description.";
      return;
    }

    this.isThinking = true;
    this.isHintPhase = false;
    this.loggingService.logEvent("aiGuessRoundStarted", {
      roundNumber: this.roundNumber,
      difficulty: this.currentDifficulty,
      description: this.userDescription,
      word: this.correctWord,
      phase: "ai-guess",
      wordCount: this.userDescription.trim().split(/\s+/).length,
    });
    this.makeAiGuess(this.userDescription);
  }

  makeAiGuess(input: string) {
    if (this.localWrongGuesses === 1) {
      input = input + " The word is not " + this.aiGuess;
    }
    this.startTimer();
    this.gameService.makeGuess(input).subscribe((response) => {
      this.aiGuess = response.guess;
      this.isThinking = false;

      this.pauseTimer();

      this.isAiGuessCorrect =
        response.guess.trim().toLowerCase() ===
        this.correctWord.trim().toLowerCase();

      this.loggingService.logEvent("aiGuessMade", {
        guess: response.guess,
        isCorrect: this.isAiGuessCorrect,
        roundNumber: this.roundNumber,
        difficulty: this.currentDifficulty,
        phase: "ai-guess",
        guessCount: this.localWrongGuesses + 1,
        correctWord: this.correctWord,
      });

      if (this.isAiGuessCorrect) {
        this.feedback = " Correct!";
        this.soundService.playCorrect();
        this.gameService.aiStats.correct++;
        setTimeout(() => {
          this.nextRound();
        }, 3000);
      } else {
        this.timerChanged.emit({ aiGuessTimeDiff: -5 });
        this.soundService.playWrong();
        this.feedback = "❌ Wrong.";

        this.localWrongGuesses++;
        if (this.localWrongGuesses === 2) {
          setTimeout(() => {
            this.isHintPhase = true;
            this.feedback = "AI: I'm not sure. Can you give me a hint?";
          }, 3000);
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

    this.loggingService.logEvent("hintProvidedByUser", {
      roundNumber: this.roundNumber,
      difficulty: this.currentDifficulty,
      phase: "ai-guess",
      hint: this.userHint,
      wordCount: this.userHint.trim().split(/\s+/).length,
    });

    const enhancedInput = this.userDescription + " HINT: " + this.userHint;
    this.userHint = "";
    this.isHintPhase = false;
    this.timerChanged.emit({ aiGuessTimeDiff: -2 });

    this.makeAiGuess(enhancedInput);
  }

  resetStateForNextWord() {
    this.userDescription = "";
    this.userHint = "";
    this.aiGuess = "";
    this.feedback = "";
    this.isAiGuessCorrect = false;
    this.localWrongGuesses = 0;
    this.hintUsed = 0;
    this.isHintPhase = false;
  }

  goBack() {
    window.location.href = "/llm-wordgame";
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
    this.timerChanged.emit({ userGuessTimeDiff: -2 });
    this.gameService.userStats.skipped++;
    this.loggingService.logEvent("userSkippedWord", {
      roundNumber: this.roundNumber,
      difficulty: this.currentDifficulty,
      phase: "ai-guess",
      reason: "user_clicked_skip",
      descriptionLength: this.userDescription.trim().length,
    });
    this.fetchWordForUserToDescribe();
  }

  nextRound() {
    this.roundCompleted.emit();
    setTimeout(() => {
      this.fetchWordForUserToDescribe();
      this.logStartRound();
    }, 200);
  }

  logStartRound() {
    this.loggingService.logEvent("newRoundStarted", {
      roundNumber: this.roundNumber,
      difficulty: this.currentDifficulty,
      category: this.currentCategory,
      aiGuess: this.aiGuess,
      timeLeft: this.aiGuessTimeLeft,
      phase: "ai-guess",
    });
  }
}
