import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

interface GameResponse {
  description: string;
  answer: string;
}

interface GuessResponse {
  guess: string;
}

interface HintResponse {
  hint: string;
}

@Injectable({
  providedIn: "root",
})
export class GameService {
  private apiUrl = "http://localhost:5001";

  constructor(private http: HttpClient) {}

  startGame(difficulty: string, category: string) {
    return this.http.post<any>(`${this.apiUrl}/start`, {
      difficulty,
      category,
    });
  }

  makeGuess(description: string): Observable<GuessResponse> {
    return this.http.post<GuessResponse>(`${this.apiUrl}/guess`, {
      description,
    });
  }

  getHint(word: string): Observable<HintResponse> {
    return this.http.post<HintResponse>(`${this.apiUrl}/hint`, { word });
  }
  fetchWord(data: { category: string; difficulty: string }) {
    return this.http.post<any>(`${this.apiUrl}/get-word`, data);
  }
}
