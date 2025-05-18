import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { GameService } from "../../services/game.service";
import { GameHeaderComponent } from "../shared/game-header/game-header.component";
import { CategoryComponent } from "../category/category.component";
import { LoggingService } from "../../services/logging.service";

@Component({
  selector: "app-user-guesses",
  standalone: true,
  imports: [CommonModule, FormsModule, GameHeaderComponent, CategoryComponent],
  templateUrl: "./user-guesses.component.html",
  styleUrls: ["./user-guesses.component.css"],
})
export class UserGuessesComponent implements OnInit {
  description = "";
  userGuess = "";
  correctWord = "";
  hints: string[] = [];
  feedback = "";
  isCorrect = false;

  categories = ["Animals", "Food", "Places"];
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
  @Output() timerChanged = new EventEmitter<{
    userGuessTimeDiff?: number;
    aiGuessTimeDiff?: number;
  }>();
  timer: any;
  gameOver = false;
  username = localStorage.getItem("username") || "Guest";
  correctAnswers = 0;
  wrongAnswers = 0;
  hintUsed = 0;

  @Input() roundNumber: number = 1;
  @Output() roundCompleted = new EventEmitter<void>();

  constructor(
    private gameService: GameService,
    private router: Router,
    private loggingService: LoggingService
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
        this.feedback = "⏰ Time is up!";
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
    console.log("Selected category:", category);
    this.currentCategory = category;
    this.pauseTimer();
    this.startNewGame();
  }

  startNewGame() {
    this.description = "";

    const currentDifficulty = this.getCurrentDifficulty(this.roundNumber);
    this.isLoading = true;

    this.gameService
      .startGame(currentDifficulty, this.currentCategory)
      .subscribe((response) => {
        this.description = response.description;
        this.correctWord = response.answer;
        this.hints = [];
        this.feedback = "";
        this.isCorrect = false;
        this.isLoading = false;
        this.startTimer();
        this.loggingService.logEvent("newRoundStarted", {
          roundNumber: this.roundNumber,
          category: this.currentCategory,
          difficulty: currentDifficulty,
          description: this.description,
        });
      });
  }

  submitGuess() {
    if (!this.userGuess.trim()) return;
    const guess = this.userGuess.trim().toLowerCase();
    const answer = this.correctWord.trim().toLowerCase();

    if (guess === answer) {
      this.loggingService.logEvent("userGuessSubmitted", {
        guess: guess,
        isCorrect: true,
        timeTaken: 60 - this.userGuessTimeLeft, //TODO: calculate time taken
        roundNumber: this.roundNumber,
        phase: "user-guess",
        category: this.currentCategory,
        difficulty: this.currentDifficulty,
      });

      this.correctAnswers++;
      this.playCorrectSound();
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
        timeTaken: 60 - this.userGuessTimeLeft, //TODO: calculate time taken
        roundNumber: this.roundNumber,
        phase: "user-guess",
        category: this.currentCategory,
        difficulty: this.currentDifficulty,
      });
      this.wrongAnswers++;
      this.playWrongSound();
      this.timerChanged.emit({ userGuessTimeDiff: -10 });
      this.feedback =
        this.userGuessTimeLeft === 0
          ? "Game Over. ⏱️ -10 seconds!"
          : "Wrong! Try again ⏱️ -10 seconds!";
    }

    this.userGuess = "";
  }

  getHint() {
    if (this.hintUsed < 3) {
      this.hintUsed++;
      this.loggingService.logEvent("hintUsed", {
        hintNumber: this.hintUsed,
        roundNumber: this.roundNumber,
        category: this.currentCategory,
        difficulty: this.currentDifficulty,
        phase: "user-guess",
      });
      // TODO: Implement logic for showing the actual hint here
    } else {
      this.revealAnswer();
    }
  }

  revealAnswer() {
    this.loggingService.logEvent("revealAnswer", {
      correctAnswer: this.correctWord,
      roundNumber: this.roundNumber,
      category: this.currentCategory,
      phase: "user-guess",
    });
    this.feedback = `The correct word was: ${this.correctWord}`;
    this.currentCategory = "";
    this.roundCompleted.emit();
  }

  playCorrectSound() {
    this.playAudio("correct-sound");
  }
  playWrongSound() {
    this.playAudio("wrong");
  }
  playApplauseSound() {
    this.playAudio("applause-sound");
  }
  playWinSound() {
    this.playAudio("win-sound");
  }
  playGameOverSound() {
    this.playAudio("game-over");
  }

  private playAudio(name: string) {
    const audio = new Audio();
    audio.src = `assets/sounds/${name}.wav`;
    audio.load();
    audio.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  }

  goBack() {
    window.location.href = "/";
  }
}
