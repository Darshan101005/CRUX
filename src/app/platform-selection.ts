import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { PlatformService } from './platform.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { ThemeService } from './theme.service';

@Component({
  standalone: true,
  selector: 'app-platform-selection',
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div [class]="themeService.isDarkMode() ? 'dark' : ''">
      <div class="min-h-screen flex items-center justify-center p-4 md:p-6 relative bg-snow dark:bg-arctic-dark text-arctic-dark dark:text-snow font-sans transition-colors duration-1000">
        
        <!-- Background Effects -->
        @if (themeService.isDarkMode()) {
          <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div class="aurora animate-in fade-in duration-1000"></div>
            <div class="neon-glow w-[600px] h-[600px] bg-[#3FD5FF]/10 -top-48 -left-48 animate-pulse"></div>
          </div>
        } @else {
          <div class="fixed inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-1000 bg-gradient-to-b from-sky-100 via-white to-snow z-0"></div>
        }

        <div class="glass-card bg-white/60 dark:bg-white/[0.03] border border-white/40 dark:border-white/5 w-full max-w-5xl p-8 md:p-14 relative z-10 animate-in fade-in zoom-in duration-500 shadow-2xl rounded-3xl">
          <div class="text-center mb-12 space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 text-[10px] font-bold tracking-widest uppercase text-sky-600 dark:text-[#3FD5FF]">
              FINAL STEP: INTEGRATION
            </div>
            <h1 class="text-4xl md:text-5xl font-bold font-display">Select one <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 dark:from-[#3FD5FF] dark:via-white dark:to-[#8e2de2] animate-gradient-x tracking-tight">Platform</span></h1>
            <p class="text-arctic-mid/70 dark:text-white/40 max-w-sm mx-auto text-sm">Select your primary communication channel to start summarization. (Free Plan)</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (platform of platforms; track platform.id) {
              <button 
                type="button"
                (click)="selectPlatform(platform.id)"
                class="glass-card bg-white dark:bg-white/5 rounded-[20px] p-6 flex flex-col items-center text-center group cursor-pointer transition-all duration-300 relative w-full hover:-translate-y-1 shadow-md border-2"
                [class.border-sky-500]="selectedId() === platform.id"
                [class.dark:border-[#3FD5FF]]="selectedId() === platform.id"
                [class.border-transparent]="selectedId() !== platform.id"
                [class.dark:border-transparent]="selectedId() !== platform.id"
              >
                @if (selectedId() === platform.id) {
                  <div class="absolute top-0 right-0 bg-sky-500 dark:bg-[#3FD5FF] text-white dark:text-slate-900 text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-tighter">
                    Selected
                  </div>
                }

                <!-- Icon Container -->
                <div class="w-16 h-16 rounded-2xl bg-black/5 dark:bg-black/20 flex items-center justify-center mb-5 shadow-inner transition-transform duration-300 group-hover:scale-110 border border-black/5 dark:border-white/5">
                  @switch(platform.id) {
                    @case ('telegram') {
                      <!-- Perfectly centered Telegram -->
                      <svg class="w-10 h-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="12" fill="#2AABEE"/>
                        <path d="M5.5 11.5L18 6.5L15.5 18.5L11.5 15L10 17V14L16 8.5L8 13.5L5.5 11.5Z" fill="white"/>
                      </svg>
                    }
                    @case ('gmail') {
                      <!-- Exact Gmail SVG -->
                      <svg class="w-10 h-10" viewBox="0 -31.5 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g>
                          <path d="M58.1818182,192.049515 L58.1818182,93.1404244 L27.5066233,65.0770089 L0,49.5040608 L0,174.59497 C0,184.253152 7.82545455,192.049515 17.4545455,192.049515 L58.1818182,192.049515 Z" fill="#4285F4"></path>
                          <path d="M197.818182,192.049515 L238.545455,192.049515 C248.203636,192.049515 256,184.224061 256,174.59497 L256,49.5040608 L224.844415,67.3422767 L197.818182,93.1404244 L197.818182,192.049515 Z" fill="#34A853"></path>
                          <polygon fill="#EA4335" points="58.1818182 93.1404244 54.0077618 54.4932827 58.1818182 17.5040608 128 69.8676972 197.818182 17.5040608 202.487488 52.4960089 197.818182 93.1404244 128 145.504061"></polygon>
                          <path d="M197.818182,17.5040608 L197.818182,93.1404244 L256,49.5040608 L256,26.2313335 C256,4.64587897 231.36,-7.65957557 214.109091,5.28587897 L197.818182,17.5040608 Z" fill="#FBBC04"></path>
                          <path d="M0,49.5040608 L26.7588051,69.5731646 L58.1818182,93.1404244 L58.1818182,17.5040608 L41.8909091,5.28587897 C24.6109091,-7.65957557 0,4.64587897 0,26.2313335 L0,49.5040608 Z" fill="#C5221F"></path>
                        </g>
                      </svg>
                    }
                    @case ('discord') {
                      <svg class="w-10 h-10" viewBox="0 0 127.14 96.36"><path fill="#5865F2" d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83A97.68 97.68 0 0 0 49 6.83 72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21h0A105.73 105.73 0 0 0 32.71 96.36 77.7 77.7 0 0 0 39.6 85.25a68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14h0c2.64-25.72-2.83-49.67-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53 48.84 65.69 42.45 65.69Zm42.24 0C78.41 65.69 73.31 60 73.31 53s5-12.74 11.43-12.74S96.1 46 96 53 91.08 65.69 84.69 65.69Z"/></svg>
                    }
                    @case ('slack') {
                      <svg class="w-10 h-10" viewBox="0 0 24 24"><path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/><path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/><path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/><path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.523-2.522v-2.522h2.523zM15.165 17.688a2.527 2.527 0 0 1-2.523-2.523 2.526 2.526 0 0 1 2.523-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.52H15.165z"/></svg>
                    }
                  }
                </div>

                <h3 class="text-base font-bold mb-1">{{platform.name}}</h3>
                <p class="text-[9px] text-arctic-mid/50 dark:text-white/30 mb-5 uppercase tracking-widest">{{platform.provider}}</p>

                <span class="w-full py-2 rounded-lg text-xs font-bold transition-all duration-300 border bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 group-hover:border-black/10 dark:group-hover:border-white/10">
                  Choose
                </span>
              </button>
            }
          </div>
        </div>

        <!-- Telegram MTProto Modal - OTP Flow -->
        @if (showTelegramModal()) {
          <div class="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300 px-4">
            <div class="glass-card bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
              <button (click)="closeTelegramModal()" class="absolute top-4 right-4 text-arctic-mid/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
                 <mat-icon>close</mat-icon>
              </button>
              
              <div class="flex flex-col items-center text-center mb-6">
                 <div class="w-16 h-16 bg-[#2AABEE]/10 rounded-full flex items-center justify-center mb-4">
                   <svg class="w-10 h-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="12" fill="#2AABEE"/>
                      <path d="M5.5 11.5L18 6.5L15.5 18.5L11.5 15L10 17V14L16 8.5L8 13.5L5.5 11.5Z" fill="white"/>
                   </svg>
                 </div>
                 <h2 class="text-xl font-bold">Connect Telegram</h2>
                 <p class="text-xs text-arctic-mid/70 dark:text-white/50 mt-1">Via secure MTProto connection</p>
              </div>

              @if (telegramStep() === 'PHONE') {
                <div class="space-y-4 mb-2">
                  <p class="text-xs text-arctic-mid/80 dark:text-white/70 text-center mb-4">Enter your phone number to receive a secure OTP code in your Telegram app.</p>
                  
                  <div class="relative flex items-center bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl transition-colors focus-within:border-[#2AABEE] z-20">
                    <!-- Custom Dropdown Trigger -->
                    <button type="button" (click)="toggleCountryDropdown()" class="flex items-center gap-2 pl-4 pr-3 py-3 border-r border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/5 transition-colors rounded-l-xl">
                      <span class="text-lg">{{selectedCountry().flag}}</span>
                      <span class="font-bold text-sm text-arctic-dark dark:text-snow">{{selectedCountry().code}}</span>
                      <mat-icon class="text-[16px] w-[16px] h-[16px] text-black/40 dark:text-white/40 transition-transform" [class.rotate-180]="isCountryDropdownOpen()">keyboard_arrow_down</mat-icon>
                    </button>

                    <!-- Dropdown Menu -->
                    @if (isCountryDropdownOpen()) {
                      <div class="absolute top-[110%] left-0 w-[240px] bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-50 max-h-[250px] overflow-y-auto py-2 animate-in fade-in zoom-in-95 duration-200">
                        @for (c of countries; track c.code) {
                          <button type="button" (click)="selectCountry(c)" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left" [class.bg-sky-50]="selectedCountry().code === c.code" [class.dark:bg-[#3FD5FF]/10]="selectedCountry().code === c.code">
                            <span class="text-xl">{{c.flag}}</span>
                            <span class="font-bold text-sm text-arctic-dark dark:text-snow w-12">{{c.code}}</span>
                            <span class="text-xs text-arctic-mid/70 dark:text-white/50 truncate">{{c.name}}</span>
                          </button>
                        }
                      </div>
                      
                      <!-- Invisible backdrop to close dropdown -->
                      <div class="fixed inset-0 z-40" (click)="isCountryDropdownOpen.set(false)"></div>
                    }

                    <input type="tel" [(ngModel)]="phoneNumber" placeholder="Phone Number" class="flex-1 w-full min-w-0 bg-transparent px-4 py-3 focus:outline-none tracking-widest font-bold text-sm text-arctic-dark dark:text-snow">
                  </div>
                  @if (phoneError()) {
                    <p class="text-[10px] text-red-500 text-center font-bold">{{ phoneError() }}</p>
                  }
                </div>
                <button (click)="sendOtp()" class="w-full mt-6 py-3 rounded-xl font-bold bg-[#2AABEE] text-white hover:bg-[#2298D6] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Send OTP Code
                </button>
              }

              @if (telegramStep() === 'OTP') {
                <div class="space-y-4 mb-2">
                  <p class="text-xs text-arctic-mid/80 dark:text-white/70 text-center mb-4">Enter the code sent to your Telegram app for <span class="font-bold">{{selectedCountry().code}} {{phoneNumber}}</span></p>
                  <div>
                    <input type="text" [(ngModel)]="otpCode" maxlength="5" pattern="\d*" placeholder="00000" class="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-center tracking-[0.5em] text-xl font-mono focus:outline-none focus:border-[#2AABEE] transition-colors text-arctic-dark dark:text-snow">
                  </div>
                </div>
                <button (click)="finishTelegramConnection()" [disabled]="!otpCode" class="w-full mt-6 py-3 rounded-xl font-bold bg-[#2AABEE] text-white hover:bg-[#2298D6] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  @if (isConnecting()) {
                    <mat-icon class="animate-spin text-sm">sync</mat-icon> Verifying...
                  } @else {
                    Verify & Connect
                  }
                </button>
              }

              @if (telegramStep() === 'PASSWORD') {
                <div class="space-y-4 mb-2">
                  <p class="text-xs text-arctic-mid/80 dark:text-white/70 text-center mb-4">Two-Step Verification is enabled. Please enter your password.</p>
                  <div>
                    <input type="password" [(ngModel)]="twoFaPassword" placeholder="Your Password" class="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-center text-xl focus:outline-none focus:border-[#2AABEE] transition-colors text-arctic-dark dark:text-snow">
                  </div>
                  @if (phoneError()) {
                    <p class="text-[10px] text-red-500 text-center font-bold">{{ phoneError() }}</p>
                  }
                </div>
                <button (click)="submitTelegramPassword()" [disabled]="!twoFaPassword" class="w-full mt-6 py-3 rounded-xl font-bold bg-[#2AABEE] text-white hover:bg-[#2298D6] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  @if (isConnecting()) {
                    <mat-icon class="animate-spin text-sm">sync</mat-icon> Verifying...
                  } @else {
                    Submit Password
                  }
                </button>
              }
            </div>
          </div>
        }
        
        <!-- General Connection Overlay -->
        @if (isConnecting() && selectedId() !== 'telegram') {
          <div class="fixed inset-0 z-50 bg-white/90 dark:bg-arctic-dark/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
            <div class="text-center space-y-6 max-w-sm px-6">
              <div class="relative w-24 h-24 mx-auto">
                <div class="absolute inset-0 border-4 border-sky-500/10 dark:border-[#3FD5FF]/10 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-t-sky-500 dark:border-t-[#3FD5FF] rounded-full animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <mat-icon class="text-2xl text-sky-500 dark:text-[#3FD5FF] animate-pulse">sync_alt</mat-icon>
                </div>
              </div>
              <div class="space-y-2">
                <h2 class="text-2xl font-bold">Establishing Link</h2>
                <p class="text-arctic-mid/50 dark:text-white/40 text-xs">Authenticating secure protocol...</p>
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
export class PlatformSelection implements OnInit {
  private router = inject(Router);
  private platformService = inject(PlatformService);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);

  selectedId = signal('');
  isConnecting = signal(false);
  
  // Telegram State
  showTelegramModal = signal(false);
  telegramStep = signal<'PHONE' | 'OTP' | 'PASSWORD'>('PHONE');
  phoneNumber = '';
  otpCode = '';
  twoFaPassword = '';
  phoneError = signal('');

  countries = [
    { code: '+1', name: 'United States / Canada', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  ];

  selectedCountry = signal(this.countries[0]);
  isCountryDropdownOpen = signal(false);

  toggleCountryDropdown() {
    this.isCountryDropdownOpen.update(v => !v);
  }

  selectCountry(country: any) {
    this.selectedCountry.set(country);
    this.isCountryDropdownOpen.set(false);
  }

  platforms = [
    { id: 'telegram', name: 'Telegram', provider: 'MESSENGER LLP' },
    { id: 'gmail', name: 'Google (Gmail)', provider: 'GOOGLE LLC' },
    { id: 'discord', name: 'Discord', provider: 'DISCORD INC.' },
    { id: 'slack', name: 'Slack', provider: 'SLACK TECHNOLOGIES' },
  ];

  ngOnInit() {
    // Check dark mode state if needed
  }

  selectPlatform(id: string) {
    this.selectedId.set(id);
    if (id === 'telegram') {
      this.telegramStep.set('PHONE');
      this.phoneNumber = '';
      this.otpCode = '';
      this.phoneError.set('');
      this.showTelegramModal.set(true);
    } else {
      this.isConnecting.set(true);
      setTimeout(() => {
        this.platformService.connect(id);
        this.isConnecting.set(false);
        this.router.navigate(['/dashboard']);
      }, 2500);
    }
  }

  closeTelegramModal() {
    this.showTelegramModal.set(false);
    this.selectedId.set(''); 
  }

  validatePhone(): boolean {
    const cleanNum = this.phoneNumber.replace(/\\D/g, '');
    if (cleanNum.length < 5) {
      this.phoneError.set('Please enter a valid phone number.');
      return false;
    }
    this.phoneError.set('');
    return true;
  }

  async sendOtp() {
    if (!this.validatePhone()) return;

    this.isConnecting.set(true);
    const fullPhone = `${this.selectedCountry().code}${this.phoneNumber}`.replace(/\s+/g, '');
    
    try {
      await firstValueFrom(this.http.post('http://localhost:5000/api/telegram/send-otp', {
        phoneNumber: fullPhone
      }));
      this.isConnecting.set(false);
      this.telegramStep.set('OTP');
    } catch (error: any) {
      this.isConnecting.set(false);
      this.phoneError.set(error.error?.error || 'Failed to send OTP. Try again.');
    }
  }

  async finishTelegramConnection() {
    this.isConnecting.set(true);
    const fullPhone = `${this.selectedCountry().code}${this.phoneNumber}`.replace(/\s+/g, '');

    // Get email directly from JWT if authService is empty (e.g. on page refresh)
    let email = this.authService.currentUser()?.email;
    if (!email) {
      const token = localStorage.getItem('token');
      if (token) {
        try { email = JSON.parse(atob(token.split('.')[1])).email; } catch (e) {}
      }
    }

    try {
      await firstValueFrom(this.http.post('http://localhost:5000/api/telegram/verify-otp', {
        phoneNumber: fullPhone,
        otpCode: this.otpCode,
        email: email
      }));
      this.showTelegramModal.set(false);
      this.isConnecting.set(false);
      this.platformService.connect('telegram');
      this.router.navigate(['/dashboard']); 
    } catch (error: any) {
      this.isConnecting.set(false);
      if (error.error?.needs_password) {
        this.telegramStep.set('PASSWORD');
      } else {
        this.phoneError.set(error.error?.error || 'Invalid OTP code.');
      }
    }
  }

  async submitTelegramPassword() {
    this.isConnecting.set(true);
    const fullPhone = `${this.selectedCountry().code}${this.phoneNumber}`.replace(/\s+/g, '');

    let email = this.authService.currentUser()?.email;
    if (!email) {
      const token = localStorage.getItem('token');
      if (token) {
        try { email = JSON.parse(atob(token.split('.')[1])).email; } catch (e) {}
      }
    }

    try {
      await firstValueFrom(this.http.post('http://localhost:5000/api/telegram/verify-password', {
        phoneNumber: fullPhone,
        password: this.twoFaPassword,
        email: email
      }));
      this.showTelegramModal.set(false);
      this.isConnecting.set(false);
      this.platformService.connect('telegram');
      this.router.navigate(['/dashboard']); 
    } catch (error: any) {
      this.isConnecting.set(false);
      this.phoneError.set(error.error?.error || 'Invalid Password.');
    }
  }
}
