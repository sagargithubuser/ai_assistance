import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  message = '';
  loading = false;
  chats = [{ from: 'Alexa', text: 'Hi! Ask me anything.' }];

  constructor(private http: HttpClient) {}

  send() {
    const text = this.message.trim();
    if (!text || this.loading) return;

    this.chats.push({ from: 'you', text });
    this.message = '';
    this.loading = true;

    this.http.post<{ reply: string }>('http://localhost:3001/chat', { message: text })
      .subscribe({
        next: (res) => this.chats.push({ from: 'Alexa', text: res.reply }),
        error: () => this.chats.push({ from: 'Alexa', text: 'Backend is not responding.' }),
        complete: () => this.loading = false,
      });
  }
}
