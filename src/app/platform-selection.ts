import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { PlatformService } from './platform.service';

@Component({
  standalone: true,
  selector: 'app-platform-selection',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-arctic-dark">
      <!-- Background Effects -->
      <div class="ice-wave -z-10"></div>
      <div class="neon-glow w-[600px] h-[600px] bg-ice-blue/5 -bottom-48 -left-48"></div>

      <div class="glass-panel w-full max-w-6xl p-10 md:p-16 relative z-10 animate-in fade-in zoom-in duration-700">
        <div class="text-center mb-16 space-y-4">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase text-ice-blue">
            Final Step: Integration
          </div>
          <h1 class="text-5xl font-display font-bold">Select one <span class="text-ice-blue">Platform</span></h1>
          <p class="text-white/40 max-w-md mx-auto">Select your primary communication channel to start summarization. (Free Plan)</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          @for (platform of platforms; track platform.id) {
            <button 
              type="button"
              (click)="selectPlatform(platform.id)"
              class="glass-panel p-10 flex flex-col items-center text-center group cursor-pointer border-white/5 hover:border-ice-blue/40 transition-all duration-500 relative overflow-hidden w-full hover:-translate-y-2"
              [class.border-ice-blue]="selectedId() === platform.id"
              [class.bg-ice-blue/[0.03]]="selectedId() === platform.id"
            >
              @if (selectedId() === platform.id) {
                <div class="absolute top-0 right-0 bg-ice-blue text-arctic-dark text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-tighter">
                  Selected
                </div>
              }

              <div class="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 group-hover:bg-ice-blue/20 group-hover:shadow-[0_0_30px_rgba(63,213,255,0.2)] transition-all duration-500">
                <mat-icon class="text-4xl text-ice-blue transition-transform duration-500 group-hover:rotate-12">{{platform.icon}}</mat-icon>
              </div>

              <h3 class="text-2xl mb-2 font-display group-hover:text-ice-blue transition-colors">{{platform.name}}</h3>
              <p class="text-xs text-white/30 mb-10">{{platform.provider}}</p>

              <span class="btn-secondary w-full justify-center group-hover:bg-ice-blue group-hover:text-arctic-dark transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(63,213,255,0.4)]">
                {{selectedId() === platform.id ? 'Selected' : 'Choose'}}
              </span>
            </button>
          }
        </div>

        <div class="flex justify-center mt-16">
          <button (click)="handleConnect()" [disabled]="!selectedId() || isConnecting()" class="btn-primary px-16 py-4 text-lg">
             @if (isConnecting()) {
               <mat-icon class="animate-spin">sync</mat-icon>
               Linking...
             } @else {
               Connect Now
             }
          </button>
        </div>

        <!-- Connection Overlay -->
        @if (isConnecting()) {
          <div class="fixed inset-0 z-50 bg-arctic-dark/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
            <div class="text-center space-y-8 max-w-sm px-6">
              <div class="relative w-32 h-32 mx-auto">
                <div class="absolute inset-0 border-4 border-ice-blue/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-ice-blue rounded-full animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <mat-icon class="text-4xl text-ice-blue animate-pulse">sync_alt</mat-icon>
                </div>
              </div>
              <div class="space-y-3">
                <h2 class="text-3xl font-display">Establishing Link</h2>
                <p class="text-white/40 text-sm">Authenticating secure protocol... Please keep this window open.</p>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformSelection {
  private router = inject(Router);
  private platformService = inject(PlatformService);

  selectedId = signal('');
  isConnecting = signal(false);

  platforms = [
    { id: 'telegram', name: 'Telegram', provider: 'Messenger LLP', icon: 'send' },
    { id: 'gmail', name: 'Google', provider: 'Google LLC', icon: 'mail' },
    { id: 'discord', name: 'Discord', provider: 'Discord Inc.', icon: 'forum' },
    { id: 'slack', name: 'Slack', provider: 'Slack Technologies', icon: 'hub' },
  ];

  selectPlatform(id: string) {
    this.selectedId.set(id);
  }

  handleConnect() {
    this.isConnecting.set(true);
    setTimeout(() => {
      this.platformService.connect(this.selectedId());
      this.isConnecting.set(false);
      this.router.navigate(['/dashboard']);
    }, 2500);
  }
}
