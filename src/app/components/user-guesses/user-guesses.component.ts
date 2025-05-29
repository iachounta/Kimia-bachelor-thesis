import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { GameService } from "../../services/game.service";
import { GameHeaderComponent } from "../shared/game-header/game-header.component";
import { CategoryComponent } from "../category/category.component";
import { LoggingService } from "../../services/logging.service";
import { SoundService } from "../../services/sound.service";

@Component({
  selector: "app-user-guesses",
  standalone: true,
  imports: [CommonModule, FormsModule, GameHeaderComponent, CategoryComponent],
  templateUrl: "./user-guesses.component.html",
  styleUrls: ["./user-guesses.component.scss"],
})
export class UserGuessesComponent implements OnInit {
  description = "";
  userGuess = "";
  correctWord = "";
  hints: string[] = [];
  feedback = "";
  isCorrect = false;

  @Input() currentCategory: string = "";
  @Input() categoryUsage: { [key: string]: number } = {
    Animals: 0,
    Food: 0,
    Places: 0,
  };
  isLoading = false;
  @Input() currentDifficulty = "";
  @Input() userGuessTimeLeft = 60;
  @Input() aiGuessTimeLeft = 60;
  @Input() isAiGuessMode: boolean = false;
  @Output() timerChanged = new EventEmitter<{
    userGuessTimeDiff?: number;
    aiGuessTimeDiff?: number;
  }>();
  timer: any;
  gameOver = false;
  username = localStorage.getItem("username") || "Guest";
  hintUsed = 0;
  localWrongGuesses = 0;
  hintGivenThisRound: boolean = false;

  @Input() roundNumber: number = 1;
  @Output() roundCompleted = new EventEmitter<void>();

  constructor(
    public gameService: GameService,
    private router: Router,
    private loggingService: LoggingService,
    private soundService: SoundService
  ) {}

  ngOnInit() {}

  getCurrentDifficulty(round: number): string {
    if (round <= 6) return "easy";
    if (round <= 12) return "medium";
    return "hard";
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      if (this.userGuessTimeLeft > 0) {
        this.timerChanged.emit({ userGuessTimeDiff: -1 });
      } else {
        clearInterval(this.timer);
        this.gameOver = true;
        this.loggingService.logEvent("timeout", {
          roundNumber: this.roundNumber,
          category: this.currentCategory,
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

  onCategorySelected(category: string) {
    this.currentCategory = category;
    this.pauseTimer();
    this.startNewGame();
  }

  startNewGame(isFromSkip: boolean = false) {
    this.pauseTimer();
    this.description = "";
    this.hints = [];
    this.hintUsed = 0;
    this.hintGivenThisRound = false;
    this.feedback = "";
    this.isCorrect = false;
    this.localWrongGuesses = 0;

    const currentDifficulty = this.getCurrentDifficulty(this.roundNumber);
    this.isLoading = true;

    this.gameService
      .startGame(currentDifficulty, this.currentCategory)
      .subscribe((response) => {
        this.description = response.description;
        this.correctWord = response.answer;
        this.isLoading = false;
        this.startTimer();
        if (!isFromSkip) {
          this.loggingService.logEvent("newRoundStarted", {
            roundNumber: this.roundNumber,
            phase: "user-guess",
            category: this.currentCategory,
            difficulty: currentDifficulty,
            description: this.description,
            timeLeft: this.userGuessTimeLeft,
            wasSkipped: isFromSkip,
            descriptionWordCount: response.description.trim().split(/\s+/)
              .length,
          });
        }
      });
  }

  submitGuess() {
    if (!this.userGuess.trim()) return;
    const guess = this.userGuess.trim().toLowerCase();
    const answer = this.correctWord.trim().toLowerCase();

    if (guess === answer) {
      this.pauseTimer();
      this.loggingService.logEvent("userGuessSubmitted", {
        guess: guess,
        isCorrect: true,
        roundNumber: this.roundNumber,
        phase: "user-guess",
        category: this.currentCategory,
        difficulty: this.currentDifficulty,
        guessCount: this.localWrongGuesses + 1,
        hintUsed: this.hintUsed,
        hintGivenThisRound: this.hintGivenThisRound,
      });

      this.gameService.userStats.correct++;
      this.soundService.playCorrect();
      this.timerChanged.emit({ userGuessTimeDiff: 10 });
      this.feedback = "Correct! +10 seconds ⏱️";
      this.isCorrect = true;

      setTimeout(() => {
        this.currentCategory = "";
        this.roundCompleted.emit();
      }, 1500);
    } else {
      this.loggingService.logEvent("userGuessSubmitted", {
        guess: guess,
        isCorrect: false,
        roundNumber: this.roundNumber,
        phase: "user-guess",
        category: this.currentCategory,
        difficulty: this.currentDifficulty,
        guessCount: this.localWrongGuesses + 0,
        hintUsed: this.hintUsed,
        hintGivenThisRound: this.hintGivenThisRound,
      });
      this.localWrongGuesses++;
      this.gameService.userStats.wrong++;
      this.soundService.playWrong();

      if (this.localWrongGuesses === 3) {
        this.pauseTimer();
        this.loggingService.logEvent("revealAnswer", {
          correctAnswer: this.correctWord,
          roundNumber: this.roundNumber,
          category: this.currentCategory,
          phase: "user-guess",
          hintUsed: this.hintUsed,
        });
        this.feedback =
          "You have used all your guesses! The correct word was: " +
          this.correctWord;
      } else {
        this.feedback = "Wrong! Try again ⏱️ -5 seconds!";
      }
      this.timerChanged.emit({ userGuessTimeDiff: -5 });
    }

    this.userGuess = "";
  }

  getHint() {
    this.hintUsed++;
    this.pauseTimer();
    this.gameService.getHint(this.correctWord).subscribe((response) => {
      this.hints.push(response.hint);
      this.feedback = `Hint: ${response.hint}`;
      this.hintGivenThisRound = true;
      this.startTimer();
      this.loggingService.logEvent("hintUsed", {
        roundNumber: this.roundNumber,
        category: this.currentCategory,
        difficulty: this.currentDifficulty,
        phase: "user-guess",
        word: this.correctWord,
        hintUsed: this.hintUsed,
        hintDescription: response.hint,
      });
      hintWordCount: response.hint.trim().split(/\s+/).length; //hint word count check chera bi range
    });
  }

  goBack() {
    window.location.href = "/";
  }

  handleSkip() {
    this.timerChanged.emit({ userGuessTimeDiff: -2 });
    this.gameService.userStats.skipped++;
    this.loggingService.logEvent("userSkippedWord", {
      roundNumber: this.roundNumber,
      difficulty: this.currentDifficulty,
      category: this.currentCategory,
      reason: "user_clicked_skip",
    });
    this.startNewGame(true);
  }

  nextRound() {
    this.roundCompleted.emit();
    this.startNewGame();
  }
}
