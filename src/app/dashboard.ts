import {ChangeDetectionStrategy, Component, inject, computed, signal, OnInit, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {PlatformService, PlatformState} from './platform.service';
import {PlanService} from './plan.service';
import {AuthService} from './auth.service';
import {TelegramService, AISummary, TelegramDialog} from './telegram.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatIconModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 animate-in fade-in duration-700 relative z-10 text-arctic-dark dark:text-snow p-4 md:p-8 min-h-screen bg-snow dark:bg-arctic-dark transition-colors duration-1000">
      <!-- Background Effects -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden dark:block">
        <div class="aurora animate-in fade-in duration-1000"></div>
      </div>

      <!-- Dashboard Header -->
      <div class="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-5 relative z-10">
        <div class="flex items-center gap-4">
          <div class="text-3xl font-black tracking-tighter">
            CRUX<span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 dark:from-[#3FD5FF] dark:via-white dark:to-[#8e2de2]">.</span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right hidden md:block">
            <h3 class="text-sm font-bold">{{ user()?.name || 'User' }}</h3>
            <p class="text-[10px] text-arctic-mid/50 dark:text-white/40 uppercase tracking-widest">{{ user()?.role || 'Admin' }}</p>
          </div>
          <button routerLink="/settings" class="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors group">
            <mat-icon class="text-arctic-mid dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors">person</mat-icon>
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
        @for (stat of reactiveStats(); track stat.label) {
          <div class="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm p-4 flex items-center gap-3">
            <div [class]="'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ' + stat.bgClass">
              <mat-icon [class]="stat.iconClass" class="text-lg">{{stat.icon}}</mat-icon>
            </div>
            <div class="min-w-0">
              <p class="text-[10px] text-arctic-mid/60 dark:text-white/40 font-medium">{{stat.label}}</p>
              <h3 class="text-lg font-bold">{{stat.value}}</h3>
            </div>
          </div>
        }
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">

        <!-- MAIN: Chats (3 cols) -->
        <div class="lg:col-span-3 space-y-4">
          <!-- Header + Search -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 class="text-xl font-display font-bold flex items-center gap-2">
              <mat-icon class="text-ice-blue">chat</mat-icon>
              Telegram Chats
              @if (telegramService.isConnected()) {
                <span class="text-[9px] font-bold uppercase tracking-widest text-wave-start bg-wave-start/10 px-2 py-0.5 rounded-full">Connected</span>
              }
            </h2>
            <div class="flex items-center gap-2">
              <div class="relative flex-1 sm:w-64">
                <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-lg">search</mat-icon>
                <input 
                  type="text" 
                  placeholder="Search chats..." 
                  [ngModel]="searchTerm()"
                  (ngModelChange)="searchTerm.set($event)"
                  class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-ice-blue/50 transition-all"
                >
              </div>
              <button (click)="refreshDialogs()" [disabled]="telegramService.isLoading()" class="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shrink-0">
                <mat-icon class="text-lg" [class.animate-spin]="telegramService.isLoading()">{{ telegramService.isLoading() ? 'sync' : 'refresh' }}</mat-icon>
              </button>
            </div>
          </div>

          @if (!telegramService.isConnected()) {
            <div class="glass-card bg-white dark:bg-white/5 border-dashed border-white/10 p-12 text-center space-y-4">
              <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                <mat-icon class="text-white/20 text-3xl">link_off</mat-icon>
              </div>
              <h3 class="text-xl font-display">Connect Telegram</h3>
              <p class="text-white/40 text-sm">Connect your Telegram account to see chats and generate AI summaries.</p>
              <a routerLink="/integrations" class="btn-primary inline-flex"><mat-icon>hub</mat-icon> Go to Integrations</a>
            </div>
          } @else {
            <!-- Chat List -->
            <div class="space-y-2">
              @for (dialog of displayedDialogs(); track dialog.id; let i = $index) {
                <div class="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm overflow-hidden transition-all duration-300"
                  [class.border-ice-blue/30]="expandedChatId() === dialog.id">

                  <!-- Chat Row -->
                  <div class="p-4 flex items-center gap-3">
                    <!-- Icon -->
                    <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10"
                      [class]="dialog.type === 'group' ? 'bg-purple-500/15' : dialog.type === 'channel' ? 'bg-amber-500/15' : 'bg-ice-blue/15'">
                      <mat-icon class="text-lg"
                        [class]="dialog.type === 'group' ? 'text-purple-400' : dialog.type === 'channel' ? 'text-amber-400' : 'text-ice-blue'">
                        {{ dialog.type === 'group' ? 'group' : dialog.type === 'channel' ? 'campaign' : 'person' }}
                      </mat-icon>
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <h4 class="text-sm font-semibold truncate">{{ dialog.name }}</h4>
                        @if (dialog.unreadCount > 0) {
                          <span class="bg-ice-blue text-arctic-dark text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{{ dialog.unreadCount }}</span>
                        }
                      </div>
                      @if (dialog.lastMessage) {
                        <p class="text-[11px] text-white/35 truncate mt-0.5">{{ dialog.lastMessage }}</p>
                      }
                    </div>

                    <!-- Summarize Button -->
                    <button 
                      (click)="toggleExpand(dialog)"
                      class="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5"
                      [class]="expandedChatId() === dialog.id 
                        ? 'bg-white/10 border border-white/20 text-white/60' 
                        : 'bg-wave-start/10 border border-wave-start/20 text-wave-start hover:bg-wave-start/20'"
                    >
                      <mat-icon class="text-sm">{{ expandedChatId() === dialog.id ? 'close' : 'auto_awesome' }}</mat-icon>
                      {{ expandedChatId() === dialog.id ? 'Close' : 'Summarize' }}
                    </button>
                  </div>

                  <!-- Expanded: Period Selection + Summary -->
                  @if (expandedChatId() === dialog.id) {
                    <div class="border-t border-white/5 bg-white/[0.02] animate-slideDown">

                      <!-- Period Selection (if no summary yet for this chat) -->
                      @if (!chatSummaries().get(dialog.id)) {
                        <div class="p-4 space-y-3">
                          <p class="text-xs text-white/40">Choose time period to summarize:</p>
                          <div class="flex flex-wrap gap-2">
                            @for (option of periodOptions; track option.value) {
                              <button 
                                (click)="summarizeChat(dialog, option.value)"
                                [disabled]="summarizingChatId() === dialog.id"
                                class="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-ice-blue/10 hover:border-ice-blue/30 hover:text-ice-blue transition-all duration-200 flex items-center gap-2"
                              >
                                <mat-icon class="text-sm">{{ option.icon }}</mat-icon>
                                {{ option.label }}
                              </button>
                            }
                          </div>
                        </div>
                      }

                      <!-- Loading -->
                      @if (summarizingChatId() === dialog.id) {
                        <div class="p-6 flex items-center gap-3">
                          <div class="relative w-8 h-8 shrink-0">
                            <div class="absolute inset-0 border-2 border-wave-start/20 rounded-full"></div>
                            <div class="absolute inset-0 border-2 border-t-wave-start rounded-full animate-spin"></div>
                          </div>
                          <div>
                            <p class="text-sm font-semibold text-wave-start">Generating summary...</p>
                            <p class="text-[10px] text-white/30">Fetching messages and analyzing with AI</p>
                          </div>
                        </div>
                      }

                      <!-- Summary Result (inline) -->
                      @if (chatSummaries().get(dialog.id); as summary) {
                        <div class="p-4 space-y-4">
                          <!-- Summary header -->
                          <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                              <mat-icon class="text-wave-start text-sm">auto_awesome</mat-icon>
                              <span class="text-xs font-bold text-wave-start">AI Summary — {{ summary.periodLabel }}</span>
                              <span class="text-[9px] text-white/30">{{ summary.messageCount }} messages</span>
                            </div>
                            <button (click)="clearChatSummary(dialog.id)" class="text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
                              <mat-icon class="text-sm">refresh</mat-icon> New
                            </button>
                          </div>

                          <!-- Overview -->
                          <div class="p-3.5 rounded-xl bg-white/5 border-l-2 border-ice-blue">
                            <p class="text-xs text-white/70 leading-relaxed">{{ summary.overview }}</p>
                          </div>

                          <!-- Important Messages -->
                          @if (summary.importantMessages && summary.importantMessages.length > 0) {
                            <div>
                              <h5 class="text-[10px] font-bold text-amber-400 mb-2 flex items-center gap-1 uppercase tracking-wider">
                                <mat-icon class="text-sm">priority_high</mat-icon> Important Messages
                              </h5>
                              <div class="space-y-1.5">
                                @for (msg of summary.importantMessages; track $index) {
                                  <div class="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-start gap-2">
                                    <span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[8px] font-bold shrink-0 mt-0.5">{{ msg.username }}</span>
                                    <p class="text-[11px] text-white/60">"{{ msg.message }}"</p>
                                  </div>
                                }
                              </div>
                            </div>
                          }

                          <!-- Due Dates -->
                          @if (summary.dueDates && summary.dueDates.length > 0) {
                            <div>
                              <h5 class="text-[10px] font-bold text-red-400 mb-2 flex items-center gap-1 uppercase tracking-wider">
                                <mat-icon class="text-sm">event</mat-icon> Deadlines
                              </h5>
                              <div class="space-y-1.5">
                                @for (due of summary.dueDates; track $index) {
                                  <div class="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                                    <div>
                                      <p class="text-[11px] font-medium">{{ due.task }}</p>
                                      <p class="text-[9px] text-white/30">by {{ due.mentionedBy }}</p>
                                    </div>
                                    <span class="text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full shrink-0">{{ due.dueDate }}</span>
                                  </div>
                                }
                              </div>
                            </div>
                          }

                          <!-- Action Items -->
                          @if (summary.actionItems && summary.actionItems.length > 0) {
                            <div>
                              <h5 class="text-[10px] font-bold text-green-400 mb-2 flex items-center gap-1 uppercase tracking-wider">
                                <mat-icon class="text-sm">check_circle</mat-icon> Action Items
                              </h5>
                              <div class="space-y-1.5">
                                @for (item of summary.actionItems; track $index) {
                                  <div class="p-2.5 rounded-lg bg-green-500/5 border border-green-500/10 flex items-center gap-2">
                                    <mat-icon class="text-green-400 text-sm shrink-0">radio_button_unchecked</mat-icon>
                                    <div>
                                      <p class="text-[11px]">{{ item.item }}</p>
                                      <p class="text-[9px] text-white/30">{{ item.assignedTo }}</p>
                                    </div>
                                  </div>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              } @empty {
                <div class="text-center py-10 text-white/30 text-sm">
                  @if (searchTerm()) {
                    No chats matching "{{ searchTerm() }}"
                  } @else if (telegramService.isLoading()) {
                    <mat-icon class="animate-spin text-2xl mb-2">sync</mat-icon>
                    <p>Loading chats...</p>
                  } @else {
                    No chats found.
                  }
                </div>
              }
            </div>

            <!-- Load More -->
            @if (hasMore()) {
              <div class="text-center pt-1">
                <button (click)="loadMore()" class="px-6 py-2.5 rounded-xl text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all inline-flex items-center gap-2">
                  <mat-icon class="text-sm">expand_more</mat-icon>
                  Load More ({{ remainingCount() }} remaining)
                </button>
              </div>
            }
          }
        </div>

        <!-- SIDEBAR (1 col) -->
        <div class="space-y-4">
          <h3 class="text-base font-display font-bold">Platforms</h3>
          <div class="space-y-2">
            @for (platform of platformService.platforms(); track platform.id) {
              @let isLocked = isIntegrationLocked(platform);
              <div class="glass-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm p-3 flex items-center justify-between" [class.opacity-40]="isLocked">
                <div class="flex items-center gap-2.5">
                  <div 
                    [style.background-color]="isLocked ? 'rgba(255,255,255,0.02)' : platform.color + '20'" 
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    <mat-icon [style.color]="isLocked ? '#555' : platform.color" class="text-base" [class.animate-pulse]="platform.status === 'connecting'">{{platform.icon}}</mat-icon>
                  </div>
                  <div>
                    <h4 class="text-xs font-medium">{{platform.name}}</h4>
                    <p class="text-[9px] text-white/35">
                      {{isLocked ? 'Locked' : (platform.status === 'connected' ? 'Connected' : (platform.status === 'connecting' ? 'Connecting...' : 'Not connected'))}}
                    </p>
                  </div>
                </div>
                @if (platform.status === 'connected') {
                  <mat-icon class="text-wave-start text-base">check_circle</mat-icon>
                } @else if (platform.status === 'connecting') {
                  <mat-icon class="text-white/20 text-sm animate-spin">sync</mat-icon>
                } @else {
                  <a [routerLink]="isLocked ? '/subscription' : '/integrations'" class="text-[9px] font-bold uppercase tracking-wider"
                    [class]="isLocked ? 'text-yellow-500' : 'text-ice-blue hover:text-white transition-colors'">
                    {{ isLocked ? 'Upgrade' : 'Connect' }}
                  </a>
                }
              </div>
            }
          </div>

          <!-- Quick Stats -->
          @if (telegramService.isConnected()) {
            <div class="glass-panel p-4 space-y-2.5">
              <h4 class="text-xs font-bold">Quick Stats</h4>
              <div class="flex justify-between text-[11px]">
                <span class="text-white/40">Total Chats</span>
                <span class="font-bold">{{ telegramService.dialogs().length }}</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-white/40">Unread</span>
                <span class="font-bold text-ice-blue">{{ totalUnread() }}</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-white/40">Summaries</span>
                <span class="font-bold text-wave-start">{{ telegramService.summaries().length }}</span>
              </div>
            </div>
          }

          <!-- Recent Summaries -->
          @if (telegramService.summaries().length > 0) {
            <div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-xs font-bold">Recent Summaries</h4>
                <a routerLink="/summaries" class="text-[9px] text-ice-blue hover:underline">View all</a>
              </div>
              <div class="space-y-1.5">
                @for (s of telegramService.summaries().slice(0, 4); track s.id) {
                  <div class="p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-white/15 transition-all" (click)="scrollToChat(s)">
                    <p class="text-[11px] font-semibold truncate">{{ s.chatName || s.periodLabel + ' Summary' }}</p>
                    <p class="text-[9px] text-white/25 truncate mt-0.5">{{ s.overview }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in {
      animation: fadeIn 0.6s ease-out forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slideDown {
      animation: slideDown 0.3s ease-out forwards;
    }
    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 2000px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  platformService = inject(PlatformService);
  planService = inject(PlanService);
  authService = inject(AuthService);
  telegramService = inject(TelegramService);
  private cdr = inject(ChangeDetectorRef);

  user = computed(() => this.authService.currentUser());
  searchTerm = signal('');
  displayLimit = signal(20);
  expandedChatId = signal<string>('');
  summarizingChatId = signal<string>('');
  chatSummaries = signal<Map<string, AISummary>>(new Map());

  periodOptions = [
    { value: 'today', label: 'Today', icon: 'today' },
    { value: 'yesterday', label: 'Yesterday', icon: 'event' },
    { value: 'week', label: 'Past Week', icon: 'date_range' },
  ];

  filteredDialogs = computed(() => {
    let dialogs = this.telegramService.dialogs();
    const term = this.searchTerm().toLowerCase();
    if (term) {
      dialogs = dialogs.filter(d =>
        d.name.toLowerCase().includes(term) ||
        d.lastMessage?.toLowerCase().includes(term)
      );
    }
    return dialogs;
  });

  displayedDialogs = computed(() => this.filteredDialogs().slice(0, this.displayLimit()));
  hasMore = computed(() => this.filteredDialogs().length > this.displayLimit());
  remainingCount = computed(() => this.filteredDialogs().length - this.displayLimit());

  totalUnread = computed(() =>
    this.telegramService.dialogs().reduce((acc, d) => acc + (d.unreadCount || 0), 0)
  );

  reactiveStats = computed(() => {
    const connectedCount = this.platformService.connectedCount();
    return [
      { label: 'Unread', value: this.totalUnread().toString(), icon: 'forum', bgClass: 'bg-ice-blue/10', iconClass: 'text-ice-blue' },
      { label: 'Chats', value: this.telegramService.dialogs().length.toString(), icon: 'chat', bgClass: 'bg-purple-500/10', iconClass: 'text-purple-400' },
      { label: 'Summaries', value: this.telegramService.summaries().length.toString(), icon: 'auto_awesome', bgClass: 'bg-wave-start/10', iconClass: 'text-wave-start' },
      { label: 'Platforms', value: `${connectedCount}/${this.getConnectionLimit() === 10 ? '∞' : this.getConnectionLimit()}`, icon: 'hub', bgClass: 'bg-orange-500/10', iconClass: 'text-orange-400' },
    ];
  });

  async ngOnInit() {
    const email = this.user()?.email;
    if (email) {
      const connected = await this.telegramService.checkStatus(email);
      if (connected) {
        this.platformService.setConnected('telegram');
        await this.telegramService.fetchDialogs(email);
      }
      this.cdr.markForCheck();
    }
  }

  loadMore() {
    this.displayLimit.update(v => v + 20);
  }

  toggleExpand(dialog: TelegramDialog) {
    if (this.expandedChatId() === dialog.id) {
      this.expandedChatId.set('');
    } else {
      this.expandedChatId.set(dialog.id);
    }
  }

  async summarizeChat(dialog: TelegramDialog, period: string) {
    const email = this.user()?.email;
    if (!email) return;

    this.summarizingChatId.set(dialog.id);
    this.cdr.markForCheck();

    const result = await this.telegramService.summarizeChat(email, dialog.id, dialog.name, period);

    if (result) {
      this.chatSummaries.update(map => {
        const newMap = new Map(map);
        newMap.set(dialog.id, result);
        return newMap;
      });
    }

    this.summarizingChatId.set('');
    this.cdr.markForCheck();
  }

  clearChatSummary(chatId: string) {
    this.chatSummaries.update(map => {
      const newMap = new Map(map);
      newMap.delete(chatId);
      return newMap;
    });
  }

  scrollToChat(summary: AISummary) {
    // Just a visual hint — could scroll in the future
    console.log('View summary for', summary.chatName);
  }

  async refreshDialogs() {
    const email = this.user()?.email;
    if (email) {
      await this.telegramService.fetchDialogs(email);
      this.cdr.markForCheck();
    }
  }

  getConnectionLimit(): number {
    const tier = this.planService.currentTier();
    if (tier === 'Elite') return 10;
    if (tier === 'Premium') return 3;
    return 1;
  }

  isIntegrationLocked(platform: PlatformState): boolean {
    if (platform.status === 'connected') return false;
    return this.platformService.connectedCount() >= this.getConnectionLimit();
  }
}
