import {ChangeDetectionStrategy, Component, signal, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {PlatformService, PlatformState} from './platform.service';

interface SummaryRecord {
  id: string;
  platform: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

@Component({
  standalone: true,
  selector: 'app-summaries',
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in fade-in duration-700">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-display">AI Summaries</h2>
          <p class="text-white/40">Your archive of intelligence insights.</p>
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
          <button class="btn-secondary">
            <mat-icon>filter_list</mat-icon>
            Filter
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6">
        @for (record of filteredRecords(); track record.id) {
          <div class="glass-panel p-8 group hover:border-wave-start/30 transition-all duration-500">
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <mat-icon class="text-ice-blue">{{getPlatformIcon(record.platform)}}</mat-icon>
                </div>
                <div>
                  <h3 class="text-xl font-semibold">{{record.title}}</h3>
                  <p class="text-sm text-white/40">{{record.platform}} • {{record.date}}</p>
                </div>
              </div>
              <div class="flex gap-2">
                @for (tag of record.tags; track tag) {
                  <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
                    {{tag}}
                  </span>
                }
              </div>
            </div>

            <div class="bg-white/5 rounded-xl p-6 border border-white/5 relative overflow-hidden">
              <div class="absolute top-0 left-0 w-1 h-full bg-wave-start"></div>
              <p class="text-white/80 leading-relaxed italic">
                "{{record.content}}"
              </p>
            </div>

            <div class="mt-6 flex items-center justify-between">
              <div class="flex gap-4">
                <button (click)="handleAction('Share')" class="text-xs flex items-center gap-1 text-ice-blue hover:text-white transition-colors">
                  <mat-icon class="text-sm">share</mat-icon> Share Insight
                </button>
                <button (click)="handleAction('Copy')" class="text-xs flex items-center gap-1 text-ice-blue hover:text-white transition-colors">
                  <mat-icon class="text-sm">content_copy</mat-icon> Copy Text
                </button>
                <button (click)="handleAction('Bookmark')" class="text-xs flex items-center gap-1 text-ice-blue hover:text-white transition-colors">
                  <mat-icon class="text-sm">bookmark_border</mat-icon> Save to Collection
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
              <h3 class="text-2xl font-display">No Summaries Archived</h3>
              <p class="text-white/40 mt-2">Connect your platforms to start generating AI insights from your communications.</p>
            </div>
            <a routerLink="/platform-selection" class="btn-primary mx-auto inline-flex">Go to Platform Selection</a>
          </div>
        }
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-center gap-4 py-8">
        <button class="p-2 rounded-full hover:bg-white/5 disabled:opacity-20" disabled>
          <mat-icon>chevron_left</mat-icon>
        </button>
        <span class="text-sm font-medium">Page 1 of 4</span>
        <button class="p-2 rounded-full hover:bg-white/5">
          <mat-icon>chevron_right</mat-icon>
        </button>
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Summaries {
  platformService = inject(PlatformService);
  searchTerm = signal('');

  private allRecords = signal<SummaryRecord[]>([
    {
      id: '1',
      platform: 'Gmail',
      title: 'Quarterly Strategy Meeting',
      date: 'April 8, 2026',
      tags: ['Strategy', 'Q2', 'Meeting'],
      content: 'The meeting focused on the expansion into the APAC region. Key decisions include hiring a regional lead by May and launching the localized app version by June 15th.'
    },
    {
      id: '2',
      platform: 'Discord',
      title: 'Community Feedback Loop',
      date: 'April 7, 2026',
      tags: ['Feedback', 'Product', 'Community'],
      content: 'Users are requesting a dark mode toggle and better integration with third-party calendar apps. Sentiment is generally positive regarding the new performance updates.'
    },
    {
      id: '3',
      platform: 'Telegram',
      title: 'Dev Ops Incident Report',
      date: 'April 6, 2026',
      tags: ['Urgent', 'Technical', 'DevOps'],
      content: 'A minor service disruption occurred at 03:00 UTC due to a database migration error. The issue was resolved within 15 minutes.'
    }
  ]);

  filteredRecords = computed(() => {
    const connectedNames = this.platformService.platforms()
      .filter((p: PlatformState) => p.status === 'connected')
      .map((p: PlatformState) => p.name);
    
    let records = this.allRecords().filter(r => connectedNames.includes(r.platform));
    
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      records = records.filter(r => 
        r.title.toLowerCase().includes(term) || 
        r.content.toLowerCase().includes(term) ||
        r.tags.some(t => t.toLowerCase().includes(term))
      );
    }
    
    return records;
  });

  getPlatformIcon(platform: string): string {
    const icons: Record<string, string> = {
      'Gmail': 'mail',
      'Telegram': 'send',
      'Discord': 'discord',
      'Slack': 'work'
    };
    return icons[platform] || 'chat';
  }

  handleAction(type: string) {
    console.log(`${type} action triggered`);
  }

  deleteRecord(id: string) {
    this.allRecords.update(records => records.filter(r => r.id !== id));
  }
}
