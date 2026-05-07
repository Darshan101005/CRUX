import {ChangeDetectionStrategy, Component, inject, computed, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {PlatformService, PlatformState} from './platform.service';
import {PlanService} from './plan.service';

interface Summary {
  id: string;
  platform: string;
  title: string;
  preview: string;
  time: string;
  category: 'work' | 'social' | 'urgent';
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in fade-in duration-700">
      <!-- Dashboard Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-display">Intelligence Overview</h1>
          <p class="text-white/40 text-sm">Welcome back, Arctic Explorer</p>
        </div>
        <div class="flex items-center gap-3">
          <button routerLink="/settings" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group">
            <mat-icon class="text-white/40 group-hover:text-white transition-colors">person</mat-icon>
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (stat of reactiveStats(); track stat.label) {
          <div class="glass-card p-6 flex items-center gap-4">
            <div [class]="'w-12 h-12 rounded-xl flex items-center justify-center ' + stat.bgClass">
              <mat-icon [class]="stat.iconClass">{{stat.icon}}</mat-icon>
            </div>
            <div>
              <p class="text-sm text-white/40 font-medium">{{stat.label}}</p>
              <h3 class="text-2xl">{{stat.value}}</h3>
            </div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Feed / Summaries -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl flex items-center gap-2">
              <mat-icon class="text-wave-start">auto_awesome</mat-icon>
              Recent AI Summaries
            </h2>
            <a routerLink="/summaries" class="text-sm text-ice-blue hover:underline">View all</a>
          </div>

          <div class="space-y-4">
            @for (summary of filteredSummaries(); track summary.id) {
              <div class="glass-card p-6 group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <mat-icon class="text-sm">{{getPlatformIconSnippet(summary.platform)}}</mat-icon>
                    </div>
                    <div>
                      <h4 class="font-semibold group-hover:text-wave-start transition-colors">{{summary.title}}</h4>
                      <p class="text-xs text-white/40">{{summary.platform}} • {{summary.time}}</p>
                    </div>
                  </div>
                  <span [class]="'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ' + getCategoryClass(summary.category)">
                    {{summary.category}}
                  </span>
                </div>
                <p class="text-sm text-white/60 leading-relaxed line-clamp-2">
                  {{summary.preview}}
                </p>
                <div class="mt-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="text-xs flex items-center gap-1 text-ice-blue hover:text-white">
                    <mat-icon class="text-sm">visibility</mat-icon> Full Summary
                  </button>
                  <button class="text-xs flex items-center gap-1 text-ice-blue hover:text-white">
                    <mat-icon class="text-sm">reply</mat-icon> Quick Reply
                  </button>
                </div>
              </div>
            } @empty {
              <div class="glass-panel p-12 text-center space-y-4 border-dashed border-white/10">
                <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                  <mat-icon class="text-white/20 text-3xl">auto_awesome</mat-icon>
                </div>
                <div>
                  <h3 class="text-xl font-display">No Activity Detected</h3>
                  <p class="text-white/40 text-sm">Connect a platform to start generating AI insights from your conversations.</p>
                </div>
                <a routerLink="/integrations" class="btn-secondary mx-auto inline-flex">Go to Integrations</a>
              </div>
            }
          </div>
        </div>

        <!-- Platforms Sidebar -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl">Platforms</h2>
            <mat-icon class="text-white/20">more_horiz</mat-icon>
          </div>

          <div class="space-y-3">
            @for (platform of platformService.platforms(); track platform.id) {
              @let isLocked = isIntegrationLocked(platform);
              <div class="glass-card p-4 flex items-center justify-between transition-all duration-300" [class.opacity-50]="isLocked">
                <div class="flex items-center gap-3">
                  <div 
                    [style.background-color]="isLocked ? 'rgba(255,255,255,0.02)' : platform.color + '20'" 
                    class="w-10 h-10 rounded-full flex items-center justify-center border border-white/5 relative"
                  >
                    <mat-icon [style.color]="isLocked ? '#444' : platform.color" [class.animate-pulse]="platform.status === 'connecting'">{{platform.icon}}</mat-icon>
                    @if (isLocked) {
                      <div class="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-arctic-dark border border-yellow-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                        <mat-icon class="text-[9px] text-yellow-500 leading-none">lock</mat-icon>
                      </div>
                    }
                  </div>
                  <div>
                    <h4 class="text-sm font-medium">{{platform.name}}</h4>
                    <p class="text-[10px] text-white/40">
                      {{isLocked ? 'Upgrade to Unlock' : (platform.status === 'connected' ? 'Synced ' + platform.lastSync : (platform.status === 'connecting' ? 'Connecting...' : 'Disconnected'))}}
                    </p>
                  </div>
                </div>
                @if (platform.status === 'connected') {
                  @if (platform.unreadCount) {
                    <span class="bg-wave-start text-arctic-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {{platform.unreadCount}}
                    </span>
                  } @else {
                    <mat-icon class="text-wave-start text-sm">check_circle</mat-icon>
                  }
                } @else if (platform.status === 'connecting') {
                   <mat-icon class="text-white/20 text-sm animate-spin">sync</mat-icon>
                } @else {
                  <a [routerLink]="isLocked ? '/subscription' : '/integrations'" [class.text-wave-start]="isLocked" [class.text-ice-blue]="!isLocked" class="text-[10px] font-bold uppercase tracking-wider hover:text-white transition-colors">
                    {{ isLocked ? 'Upgrade' : 'Connect' }}
                  </a>
                }
              </div>
            }
          </div>

          <div class="glass-panel p-6 bg-gradient-to-br from-arctic-light/50 to-arctic-dark/50 relative overflow-hidden">
            @if (isGeneratingInsight()) {
              <div class="absolute inset-0 bg-arctic-dark/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-300">
                <mat-icon class="text-wave-start animate-spin mb-2">sync</mat-icon>
                <p class="text-xs font-medium text-wave-start">Consulting Neural Network...</p>
              </div>
            }
            <h3 class="text-lg mb-4">AI Insights</h3>
            <p class="text-sm text-white/60 mb-6">Explore the landscape of your digital communications with CRUX AI.</p>
            <button 
              (click)="generateInsight()"
              class="btn-primary w-full justify-center" 
              [disabled]="platformService.connectedCount() === 0 || isGeneratingInsight()" 
              [class.opacity-50]="platformService.connectedCount() === 0"
            >
              <mat-icon>{{ isGeneratingInsight() ? 'sync' : 'bolt' }}</mat-icon>
              {{ isGeneratingInsight() ? 'Generating...' : 'Generate Insight' }}
            </button>
          </div>
        </div>
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
export class Dashboard {
  platformService = inject(PlatformService);
  planService = inject(PlanService);
  isGeneratingInsight = signal(false);

  generateInsight() {
    if (this.platformService.connectedCount() === 0) return;
    
    this.isGeneratingInsight.set(true);
    // Simulate AI thinking
    setTimeout(() => {
      this.isGeneratingInsight.set(false);
      // In a real app, this would add a new summary or open a modal
      alert('AI Insight Generated: Your communication efficiency has increased by 24% after integrating ' + 
        this.platformService.platforms().filter(p => p.status === 'connected')[0]?.name + '!');
    }, 2500);
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

  private allSummaries: Summary[] = [
    { 
      id: 's1', 
      platform: 'Gmail', 
      title: 'Project Phoenix Update', 
      preview: 'The team has reached a consensus on the new architecture. Key milestones for Q3 have been adjusted to prioritize the mobile rollout. Action item: Review the updated roadmap by Friday.', 
      time: '10:45 AM', 
      category: 'work' 
    },
    { 
      id: 's2', 
      platform: 'Telegram', 
      title: 'Family Group Chat', 
      preview: 'Discussion about the upcoming weekend trip. Most members prefer the mountain cabin over the beach house. Budget estimates are being finalized.', 
      time: '09:30 AM', 
      category: 'social' 
    },
    { 
      id: 's3', 
      platform: 'Discord', 
      title: 'Dev Community - AI Trends', 
      preview: 'High activity in the #ai-research channel. Several new papers on multi-modal transformers were shared. Community sentiment is very positive about the latest Gemini updates.', 
      time: 'Yesterday', 
      category: 'urgent' 
    },
  ];

  filteredSummaries = computed(() => {
    const connectedNames = this.platformService.platforms()
      .filter((p: PlatformState) => p.status === 'connected')
      .map((p: PlatformState) => p.name);
    return this.allSummaries.filter(s => connectedNames.includes(s.platform));
  });

  reactiveStats = computed(() => {
    const connectedCount = this.platformService.connectedCount();
    const unreadTotal = this.platformService.platforms()
      .reduce((acc: number, p: PlatformState) => acc + (p.unreadCount || 0), 0);

    return [
      { label: 'Unread Messages', value: unreadTotal.toString(), icon: 'forum', bgClass: 'bg-ice-blue/10', iconClass: 'text-ice-blue' },
      { label: 'AI Summaries', value: this.filteredSummaries().length.toString(), icon: 'auto_awesome', bgClass: 'bg-wave-start/10', iconClass: 'text-wave-start' },
      { label: 'Time Saved', value: (connectedCount * 1.5).toFixed(1) + 'h', icon: 'timer', bgClass: 'bg-purple-500/10', iconClass: 'text-purple-400' },
      { label: 'Active Platforms', value: `${connectedCount}/${this.getConnectionLimit() === 10 ? '∞' : this.getConnectionLimit()}`, icon: 'hub', bgClass: 'bg-orange-500/10', iconClass: 'text-orange-400' },
    ];
  });

  getPlatformIconSnippet(platformName: string): string {
    const icons: Record<string, string> = {
      'Gmail': 'mail',
      'Telegram': 'send',
      'Discord': 'discord',
      'Slack': 'work'
    };
    return icons[platformName] || 'chat';
  }

  getCategoryClass(category: string): string {
    switch (category) {
      case 'work': return 'bg-blue-500/20 text-blue-400';
      case 'social': return 'bg-green-500/20 text-green-400';
      case 'urgent': return 'bg-red-500/20 text-red-400';
      default: return 'bg-white/10 text-white/60';
    }
  }
}
