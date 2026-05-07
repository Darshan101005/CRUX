import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-analytics',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-8 animate-in fade-in duration-700">
      <div class="flex flex-col gap-2">
        <h2 class="text-3xl font-display">Communication Analytics</h2>
        <p class="text-white/40">Insights into your digital footprint and productivity.</p>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (metric of metrics; track metric.label) {
          <div class="glass-panel p-6 flex flex-col gap-2">
            <span class="text-xs font-bold uppercase tracking-widest text-white/40">{{metric.label}}</span>
            <div class="flex items-baseline gap-2">
              <h3 class="text-3xl font-display">{{metric.value}}</h3>
              <span [class]="metric.trend >= 0 ? 'text-wave-start text-xs' : 'text-red-400 text-xs'">
                {{metric.trend >= 0 ? '+' : ''}}{{metric.trend}}%
              </span>
            </div>
            <div class="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div [style.width]="metric.progress + '%'" class="h-full bg-gradient-to-r from-wave-start to-wave-end"></div>
            </div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Volume Chart (Mock) -->
        <div class="glass-panel p-8">
          <h3 class="text-xl mb-6">Message Volume</h3>
          <div class="h-64 flex items-end justify-between gap-2">
            @for (val of volumeData; track $index) {
              <div class="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  [style.height]="val + '%'" 
                  class="w-full bg-ice-blue/20 border border-ice-blue/40 rounded-t-lg group-hover:bg-wave-start/40 group-hover:border-wave-start/60 transition-all duration-300 relative"
                >
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-arctic-mid px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                    {{val}}%
                  </div>
                </div>
                <span class="text-[10px] text-white/20 uppercase tracking-tighter">Day {{ $index + 1 }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Platform Distribution -->
        <div class="glass-panel p-8">
          <h3 class="text-xl mb-6">Platform Distribution</h3>
          <div class="space-y-6">
            @for (item of distribution; track item.name) {
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="flex items-center gap-2">
                    <mat-icon [style.color]="item.color" class="text-sm">{{item.icon}}</mat-icon>
                    {{item.name}}
                  </span>
                  <span class="text-white/40">{{item.percentage}}%</span>
                </div>
                <div class="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div [style.width]="item.percentage + '%'" [style.background-color]="item.color" class="h-full opacity-60"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Productivity Insights -->
      <div class="glass-panel p-8 bg-gradient-to-br from-arctic-light/30 to-arctic-dark/30">
        <div class="flex items-start gap-6">
          <div class="w-16 h-16 rounded-2xl bg-wave-start/20 flex items-center justify-center border border-wave-start/40">
            <mat-icon class="text-wave-start text-3xl">psychology</mat-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-xl mb-2">AI Productivity Coach</h3>
            <p class="text-white/60 leading-relaxed mb-6">
              Based on your communication patterns, you are most active between 10:00 AM and 12:00 PM. 
              We recommend scheduling deep work blocks in the afternoon to avoid peak notification periods. 
              Your response time has improved by 15% this week.
            </p>
            <div class="flex gap-4">
              <button class="btn-primary">Get Detailed Report</button>
              <button class="btn-secondary">Optimize Notifications</button>
            </div>
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
export class Analytics {
  metrics = [
    { label: 'Avg. Response Time', value: '12m', trend: 15, progress: 85 },
    { label: 'Information Density', value: 'High', trend: 8, progress: 72 },
    { label: 'Focus Score', value: '78/100', trend: -2, progress: 78 },
  ];

  volumeData = [40, 65, 50, 85, 70, 90, 60, 75, 55, 80, 95, 65];

  distribution = [
    { name: 'Gmail', icon: 'mail', percentage: 45, color: '#EA4335' },
    { name: 'Telegram', icon: 'send', percentage: 30, color: '#0088CC' },
    { name: 'Discord', icon: 'discord', percentage: 15, color: '#5865F2' },
    { name: 'Slack', icon: 'work', percentage: 10, color: '#4A154B' },
  ];
}
