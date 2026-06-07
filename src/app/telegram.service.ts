import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TelegramDialog {
  id: string;
  name: string;
  type: 'user' | 'group' | 'channel';
  unreadCount: number;
  lastMessage: string;
  lastMessageDate: string;
  lastMessageSender: string;
}

export interface TelegramMessage {
  id: number;
  text: string;
  sender: string;
  senderUsername: string;
  date: string;
  chatName: string;
  chatId: string;
}

export interface AISummary {
  id: string;
  period: string;
  periodLabel: string;
  chatName?: string;
  overview: string;
  importantMessages: { username: string; message: string }[];
  dueDates: { task: string; dueDate: string; mentionedBy: string }[];
  actionItems: { item: string; assignedTo: string }[];
  generatedAt: string;
  messageCount: number;
  chatCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private apiUrl = 'http://localhost:5000/api';
  
  isConnected = signal(false);
  dialogs = signal<TelegramDialog[]>([]);
  summaries = signal<AISummary[]>([]);
  isLoading = signal(false);
  isSummarizing = signal(false);

  constructor(private http: HttpClient) {
    // Load cached summaries from localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('crux_summaries');
        if (cached) {
          this.summaries.set(JSON.parse(cached));
        }
      }
    } catch (e) {}
  }

  async checkStatus(email: string): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/telegram/status?email=${encodeURIComponent(email)}`)
      );
      this.isConnected.set(res.connected);
      return res.connected;
    } catch (e) {
      this.isConnected.set(false);
      return false;
    }
  }

  async fetchDialogs(email: string): Promise<TelegramDialog[]> {
    try {
      this.isLoading.set(true);
      const res: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/telegram/dialogs?email=${encodeURIComponent(email)}`)
      );
      this.dialogs.set(res.dialogs || []);
      return res.dialogs || [];
    } catch (e) {
      console.error('Failed to fetch dialogs:', e);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchAllMessages(email: string, period: string): Promise<TelegramMessage[]> {
    try {
      const res: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/telegram/messages/all`, { email, period })
      );
      return res.messages || [];
    } catch (e) {
      console.error('Failed to fetch messages:', e);
      return [];
    }
  }

  async summarize(email: string, period: string): Promise<AISummary | null> {
    try {
      this.isSummarizing.set(true);
      const res: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/summarize`, { email, period })
      );
      
      if (res.summary) {
        const newSummary: AISummary = {
          ...res.summary,
          id: Date.now().toString(),
          generatedAt: new Date().toISOString(),
        };
        
        this.summaries.update(list => [newSummary, ...list]);
        
        // Cache in localStorage
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('crux_summaries', JSON.stringify(this.summaries()));
          }
        } catch (e) {}
        
        return newSummary;
      }
      return null;
    } catch (e) {
      console.error('Summarization failed:', e);
      return null;
    } finally {
      this.isSummarizing.set(false);
    }
  }

  chatSummary = signal<AISummary | null>(null);
  isChatSummarizing = signal(false);

  async summarizeChat(email: string, chatId: string, chatName: string, period: string): Promise<AISummary | null> {
    try {
      this.isChatSummarizing.set(true);
      const res: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/summarize/chat`, { email, chatId, chatName, period })
      );
      
      if (res.summary) {
        const newSummary: AISummary = {
          ...res.summary,
          id: Date.now().toString(),
          generatedAt: new Date().toISOString(),
        };
        
        this.chatSummary.set(newSummary);
        this.summaries.update(list => [newSummary, ...list]);
        
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('crux_summaries', JSON.stringify(this.summaries()));
          }
        } catch (e) {}
        
        return newSummary;
      }
      return null;
    } catch (e) {
      console.error('Chat summarization failed:', e);
      return null;
    } finally {
      this.isChatSummarizing.set(false);
    }
  }

  clearSummaries() {
    this.summaries.set([]);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('crux_summaries');
      }
    } catch (e) {}
  }
}
