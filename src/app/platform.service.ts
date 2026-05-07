import {Injectable, signal, computed} from '@angular/core';

export interface PlatformState {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'connected' | 'disconnected' | 'connecting';
  protocol: string;
  lastSync?: string;
  unreadCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  private platformsList = signal<PlatformState[]>([
    { 
      id: 'gmail', 
      name: 'Gmail', 
      icon: 'mail', 
      color: '#EA4335', 
      status: 'disconnected', 
      protocol: 'OAuth 2.0' 
    },
    { 
      id: 'telegram', 
      name: 'Telegram', 
      icon: 'send', 
      color: '#0088CC', 
      status: 'disconnected', 
      protocol: 'MTProto' 
    },
    { 
      id: 'discord', 
      name: 'Discord', 
      icon: 'discord', 
      color: '#5865F2', 
      status: 'disconnected', 
      protocol: 'OAuth 2.0' 
    },
    { 
      id: 'slack', 
      name: 'Slack', 
      icon: 'work', 
      color: '#4A154B', 
      status: 'disconnected', 
      protocol: 'OAuth 2.0' 
    }
  ]);

  platforms = computed(() => this.platformsList());
  
  connectedCount = computed(() => 
    this.platformsList().filter(p => p.status === 'connected').length
  );

  connect(id: string) {
    this.updateStatus(id, 'connecting');
    
    // Simulate protocol-specific delay
    setTimeout(() => {
      this.updateStatus(id, 'connected', {
        lastSync: 'just now',
        unreadCount: Math.floor(Math.random() * 20) + 1
      });
    }, 1500);
  }

  disconnect(id: string) {
    this.updateStatus(id, 'disconnected', { lastSync: undefined, unreadCount: 0 });
  }

  private updateStatus(id: string, status: 'connected' | 'disconnected' | 'connecting', extra: Partial<PlatformState> = {}) {
    this.platformsList.update(list => 
      list.map(p => p.id === id ? { ...p, status, ...extra } : p)
    );
  }
}
