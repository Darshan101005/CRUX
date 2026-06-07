import {ChangeDetectionStrategy, Component, signal, inject, computed, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {TelegramService, AISummary} from './telegram.service';
import {AuthService} from './auth.service';

@Component({
  standalone: true,
  selector: 'app-summaries',
  imports: [CommonModule, MatIconModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in fade-in duration-700 p-4 md:p-8 min-h-screen">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-display">AI Summaries</h2>
          <p class="text-white/40">Your archive of intelligence insights from Telegram.</p>
        </div>
        <div class="flex gap-3">
          <div class="relative">
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">search</mat-icon>
            <input 
              type="text" 
              placeholder="Search summaries..." 
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              class="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-wave-start transition-all w-64"
            >
          </div>
          <button (click)="generateNewSummary()" 
            class="btn-primary"
            [disabled]="telegramService.isSummarizing()">
            <mat-icon>{{ telegramService.isSummarizing() ? 'sync' : 'add' }}</mat-icon>
            {{ telegramService.isSummarizing() ? 'Generating...' : 'New Summary' }}
          </button>
        </div>
      </div>

      <!-- Period Selection for New Summary -->
      @if (showPeriodSelector()) {
        <div class="glass-panel p-6 animate-in fade-in duration-300">
          <h3 class="text-lg mb-4">Select Time Period</h3>
          <div class="flex gap-3 flex-wrap">
            @for (option of periodOptions; track option.value) {
              <button 
                (click)="doSummarize(option.value)"
                [disabled]="telegramService.isSummarizing()"
                class="px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-ice-blue/30"
              >
                <mat-icon class="text-sm">{{ option.icon }}</mat-icon>
                {{ option.label }}
              </button>
            }
            <button (click)="showPeriodSelector.set(false)" class="px-4 py-3 rounded-2xl text-white/40 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      }

      @if (telegramService.isSummarizing()) {
        <div class="glass-panel p-8 text-center animate-in fade-in duration-300">
          <mat-icon class="text-wave-start text-4xl animate-spin mb-4">sync</mat-icon>
          <h3 class="text-xl font-display mb-2">Generating Summary...</h3>
          <p class="text-white/40 text-sm">Fetching messages from Telegram and analyzing with AI</p>
        </div>
      }

      <div class="grid grid-cols-1 gap-6">
        @for (record of filteredRecords(); track record.id) {
          <div class="glass-panel p-8 group hover:border-wave-start/30 transition-all duration-500">
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-wave-start/10 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <mat-icon class="text-wave-start">auto_awesome</mat-icon>
                </div>
                <div>
                  <h3 class="text-xl font-semibold">{{ record.periodLabel }} Summary</h3>
                  <p class="text-sm text-white/40">Telegram • {{ record.messageCount }} messages from {{ record.chatCount }} chats • {{ formatDate(record.generatedAt) }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <span class="px-3 py-1 rounded-full bg-ice-blue/10 border border-ice-blue/20 text-[10px] font-bold uppercase tracking-widest text-ice-blue">
                  {{ record.periodLabel }}
                </span>
              </div>
            </div>

            <!-- Overview -->
            <div class="bg-white/5 rounded-xl p-6 border border-white/5 relative overflow-hidden mb-4">
              <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-ice-blue to-wave-start"></div>
              <p class="text-white/80 leading-relaxed pl-3">
                {{ record.overview }}
              </p>
            </div>

            <!-- Important Messages -->
            @if (record.importantMessages.length > 0) {
              <div class="mb-4">
                <h4 class="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1">
                  <mat-icon class="text-sm">priority_high</mat-icon> Important Messages ({{ record.importantMessages.length }})
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  @for (msg of record.importantMessages.slice(0, 4); track $index) {
                    <div class="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <span class="text-[10px] font-bold text-amber-400">{{ msg.username }}</span>
                      <p class="text-xs text-white/60 mt-1 line-clamp-2">"{{ msg.message }}"</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Due Dates -->
            @if (record.dueDates.length > 0) {
              <div class="mb-4">
                <h4 class="text-sm font-bold text-red-400 mb-2 flex items-center gap-1">
                  <mat-icon class="text-sm">event</mat-icon> Deadlines Detected ({{ record.dueDates.length }})
                </h4>
                <div class="space-y-2">
                  @for (due of record.dueDates; track $index) {
                    <div class="p-3 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                      <div>
                        <p class="text-sm">{{ due.task }}</p>
                        <p class="text-[10px] text-white/40">by {{ due.mentionedBy }}</p>
                      </div>
                      <span class="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">{{ due.dueDate }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Action Items -->
            @if (record.actionItems.length > 0) {
              <div class="mb-4">
                <h4 class="text-sm font-bold text-green-400 mb-2 flex items-center gap-1">
                  <mat-icon class="text-sm">check_circle</mat-icon> Action Items ({{ record.actionItems.length }})
                </h4>
                <div class="space-y-2">
                  @for (item of record.actionItems; track $index) {
                    <div class="p-3 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center gap-3">
                      <mat-icon class="text-green-400 text-sm">radio_button_unchecked</mat-icon>
                      <div>
                        <p class="text-sm">{{ item.item }}</p>
                        <p class="text-[10px] text-white/40">{{ item.assignedTo }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <div class="mt-6 flex items-center justify-between">
              <div class="flex gap-4">
                <button (click)="copyText(record)" class="text-xs flex items-center gap-1 text-ice-blue hover:text-white transition-colors">
                  <mat-icon class="text-sm">content_copy</mat-icon> Copy Summary
                </button>
              </div>
              <button (click)="deleteRecord(record.id)" class="text-xs text-white/20 hover:text-red-400 transition-colors">
                <mat-icon class="text-sm">delete</mat-icon>
              </button>
            </div>
          </div>
        } @empty {
          <div class="glass-panel p-20 text-center space-y-6 border-dashed border-white/10 animate-in fade-in zoom-in duration-500">
            <div class="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
              <mat-icon class="text-white/20 text-5xl">folder_open</mat-icon>
            </div>
            <div class="max-w-md mx-auto">
              <h3 class="text-2xl font-display">No Summaries Yet</h3>
              <p class="text-white/40 mt-2">Connect Telegram and generate your first AI summary from the dashboard.</p>
            </div>
            <a routerLink="/dashboard" class="btn-primary mx-auto inline-flex">
              <mat-icon>dashboard</mat-icon> Go to Dashboard
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in {
      animation: fadeIn 0.8s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Summaries {
  telegramService = inject(TelegramService);
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  searchTerm = signal('');
  showPeriodSelector = signal(false);

  periodOptions = [
    { value: 'today', label: 'Today', icon: 'today' },
    { value: 'yesterday', label: 'Yesterday', icon: 'event' },
    { value: 'week', label: 'Past Week', icon: 'date_range' },
  ];

  filteredRecords = computed(() => {
    let records = this.telegramService.summaries();
    
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      records = records.filter(r => 
        r.overview.toLowerCase().includes(term) || 
        r.periodLabel.toLowerCase().includes(term) ||
        r.importantMessages.some(m => m.message.toLowerCase().includes(term) || m.username.toLowerCase().includes(term)) ||
        r.actionItems.some(a => a.item.toLowerCase().includes(term))
      );
    }
    
    return records;
  });

  generateNewSummary() {
    this.showPeriodSelector.update(v => !v);
  }

  async doSummarize(period: string) {
    const email = this.authService.currentUser()?.email;
    if (!email) return;
    
    this.showPeriodSelector.set(false);
    this.cdr.markForCheck();
    
    await this.telegramService.summarize(email, period);
    this.cdr.markForCheck();
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  }

  copyText(record: AISummary) {
    const text = `📋 ${record.periodLabel} Summary\n\n🔍 Overview:\n${record.overview}\n\n` +
      (record.importantMessages.length > 0 
        ? `⚠️ Important Messages:\n${record.importantMessages.map(m => `• ${m.username}: "${m.message}"`).join('\n')}\n\n` 
        : '') +
      (record.dueDates.length > 0 
        ? `📅 Due Dates:\n${record.dueDates.map(d => `• ${d.task} — ${d.dueDate} (by ${d.mentionedBy})`).join('\n')}\n\n` 
        : '') +
      (record.actionItems.length > 0 
        ? `✅ Action Items:\n${record.actionItems.map(a => `• ${a.item} (${a.assignedTo})`).join('\n')}` 
        : '');
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Summary copied to clipboard!');
    });
  }

  deleteRecord(id: string) {
    this.telegramService.summaries.update(list => list.filter(r => r.id !== id));
    // Update localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('crux_summaries', JSON.stringify(this.telegramService.summaries()));
      }
    } catch (e) {}
  }
}
