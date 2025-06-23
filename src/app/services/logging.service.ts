// src/app/services/logging.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class LoggingService {
  private endpoint = "/llm-api/log";
  constructor(private http: HttpClient) {}

  logEvent(event: string, details: any) {
    const payload = {
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      username: localStorage.getItem("username") || "Guest",
      event,
      details,
    };
    this.http.post(this.endpoint, payload).subscribe();
  }

  private getSessionId(): string {
    if (!localStorage.getItem("sessionId")) {
      localStorage.setItem("sessionId", crypto.randomUUID());
    }
    return localStorage.getItem("sessionId")!;
  }
}
