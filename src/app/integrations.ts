import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {PlatformService, PlatformState} from './platform.service';
import {PlanService} from './plan.service';

@Component({
  standalone: true,
  selector: 'app-integrations',
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="space-y-8 animate-in fade-in duration-700">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-col gap-2">
          <h2 class="text-3xl font-display">Integrations</h2>
          <p class="text-white/40">Connect your favorite platforms to CRUX for unified intelligence.</p>
        </div>
        
        <div class="glass-panel px-6 py-4 border-wave-start/20 bg-wave-start/5 flex items-center gap-4">
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-black tracking-widest text-wave-start">Current Plan</span>
            <span class="text-xl font-display">{{planService.currentTier()}}</span>
          </div>
          <div class="h-8 w-px bg-white/10 mx-2"></div>
          <div class="flex flex-col">
             <span class="text-[10px] uppercase font-black tracking-widest text-white/40">Connections</span>
             <span class="text-xl font-display">{{platformService.connectedCount()}} / {{getConnectionLimit()}}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @for (platform of platformService.platforms(); track platform.id) {
          @let isLocked = isIntegrationLocked(platform);
          
          <div 
            class="glass-panel p-8 flex flex-col items-center text-center group relative overflow-hidden transition-all duration-500"
            [class.opacity-50]="isLocked"
            [class.grayscale]="isLocked"
          >
            <!-- Background Glow -->
            <div [style.background-color]="platform.color + '10'" class="absolute inset-0 -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div 
              [style.background-color]="isLocked ? 'rgba(255,255,255,0.05)' : platform.color + '20'" 
              class="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-300 relative"
            >
              <mat-icon [style.color]="isLocked ? '#666' : platform.color" [class.animate-pulse]="platform.status === 'connecting'" class="text-4xl w-10 h-10 flex items-center justify-center">{{platform.icon}}</mat-icon>
              
              @if (isLocked) {
                <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-arctic-dark border border-white/10 flex items-center justify-center shadow-lg">
                  <mat-icon class="text-sm text-yellow-500">lock</mat-icon>
                </div>
              }
            </div>

            <h3 class="text-xl mb-2">{{platform.name}}</h3>
            <p class="text-sm text-white/60 mb-8">{{getPlatformDescription(platform.id)}}</p>

            <div class="mt-auto w-full space-y-3">
              @if (platform.status === 'connected') {
                <div class="flex items-center justify-center gap-2 text-wave-start mb-4">
                  <mat-icon class="text-sm">check_circle</mat-icon>
                  <span class="text-xs font-bold uppercase tracking-widest">Connected</span>
                </div>
                <button (click)="platformService.disconnect(platform.id)" class="btn-secondary w-full justify-center text-red-400 hover:bg-red-500/10 hover:border-red-500/20">
                  Disconnect
                </button>
              } @else if (platform.status === 'connecting') {
                <button disabled class="btn-primary w-full justify-center opacity-70 cursor-wait">
                  <mat-icon class="animate-spin">sync</mat-icon>
                  Connecting...
                </button>
              } @else if (isLocked) {
                <button routerLink="/subscription" class="btn-secondary w-full justify-center gap-2 group/btn">
                  <mat-icon class="text-sm text-wave-start group-hover/btn:scale-110 transition-transform">workspace_premium</mat-icon>
                  Upgrade to Unlock
                </button>
              } @else {
                <button (click)="handleConnect(platform)" class="btn-primary w-full justify-center">
                  Connect {{platform.name}}
                </button>
              }
            </div>

            <!-- Protocol Badge -->
            <div class="absolute top-4 right-4 px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-tighter text-white/40">
              {{platform.protocol}}
            </div>
          </div>
        }
      </div>

      <!-- Custom Integration -->
      <div class="glass-card p-8 flex items-center justify-between border-dashed">
        <div class="flex items-center gap-6">
          <div class="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
            <mat-icon class="text-white/20">add</mat-icon>
          </div>
          <div>
            <h3 class="text-lg">Request a New Integration</h3>
            <p class="text-sm text-white/40">Don't see your platform? Let us know what we should add next.</p>
          </div>
        </div>
        <button class="btn-secondary">Submit Request</button>
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
export class Integrations {
  platformService = inject(PlatformService);
  planService = inject(PlanService);

  getConnectionLimit(): number {
    const tier = this.planService.currentTier();
    if (tier === 'Elite') return 10; // "Unlimited" for our case
    if (tier === 'Premium') return 3;
    return 1;
  }

  isIntegrationLocked(platform: PlatformState): boolean {
    if (platform.status === 'connected') return false;
    return this.platformService.connectedCount() >= this.getConnectionLimit();
  }

  getPlatformDescription(id: string): string {
    const descriptions: Record<string, string> = {
      gmail: 'Sync your emails and get thread summaries using standard OAuth 2.0.',
      telegram: 'Connect via MTProto for real-time chat insights and direct bot interaction.',
      discord: 'Monitor servers and channels for key discussions with selective channel permissions.',
      slack: 'Integrate your workspace for productivity summaries and urgent ping detection.'
    };
    return descriptions[id] || 'Connect your account to start syncing data.';
  }

  handleConnect(platform: PlatformState) {
    if (this.isIntegrationLocked(platform)) {
      alert(`Connection limit reached for ${this.planService.currentTier()} plan. Please upgrade to add more integrations.`);
      return;
    }
    
    if (platform.id === 'telegram') {
      // Protocol specific: Telegram uses deep links or web-based login
      // Simulating opening the official Crux bot for authentication via MTProto
      window.open(`https://t.me/crux_intelligence_bot?start=auth_secure_${Math.random().toString(36).substring(7)}`, '_blank');
      this.platformService.connect(platform.id);
    } else {
      // OAuth 2.0 flow simulation
      const popupWidth = 500;
      const popupHeight = 600;
      const left = (window.innerWidth - popupWidth) / 2;
      const top = (window.innerHeight - popupHeight) / 2;
      
      const popup = window.open(
        'about:blank', 
        'AuthPopup', 
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
      );
      
      if (popup) {
        popup.document.write(`
          <style>
            body { background: #0F1214; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { background: rgba(255,255,255,0.05); padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); max-width: 80%; }
            .btn { background: #43E97B; color: #0F1214; border: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; cursor: pointer; margin-top: 24px; font-size: 16px; width: 100%; transition: scale 0.2s; }
            .btn:hover { transform: scale(1.02); }
            .perms { text-align: left; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 12px; margin: 20px 0; }
            li { font-size: 13px; margin: 8px 0; opacity: 0.8; }
          </style>
          <body>
            <div class="card">
              <h2 style="margin-top:0">Authorize CRUX Intelligence</h2>
              <p style="opacity:0.6; font-size:14px;">Requested permissions for <b>${platform.name}</b>:</p>
              <div class="perms">
                <ul style="margin:0; padding-left: 20px;">
                  <li>Read message contents and attachments</li>
                  <li>Sync thread metadata and categories</li>
                  <li>Analyze sender authenticity</li>
                  <li>Extract key action items</li>
                </ul>
              </div>
              <p style="font-size:11px; opacity:0.4;">Connection protocol: ${platform.protocol}</p>
              <button class="btn" onclick="window.close()">Allow Secure Access</button>
              <button class="btn" style="background:transparent; color:#888; border:1px solid #333;" onclick="window.close()">Cancel</button>
            </div>
          </body>
        `);
        
        // Start the connection process once popup is acknowledged (simulated)
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            this.platformService.connect(platform.id);
          }
        }, 500);
      }
    }
  }
}
