import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, MatIconModule, RouterLink, ReactiveFormsModule],
  template: `
    <div [class]="isDarkMode() ? 'dark' : ''">
      <!-- Main Container matching Landing Page Background -->
      <div class="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden transition-colors duration-1000 bg-snow dark:bg-arctic-dark font-sans text-arctic-dark dark:text-snow">
        
        <!-- Background Effects (Theme Dependent) -->
        @if (isDarkMode()) {
          <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div class="aurora animate-in fade-in duration-1000"></div>
            <div class="neon-glow w-[600px] h-[600px] bg-[#3FD5FF]/10 -top-48 -left-48 animate-pulse"></div>
            <div class="neon-glow w-[500px] h-[500px] bg-[#8e2de2]/10 -bottom-32 -right-32 animate-pulse delay-1000"></div>
            <div class="absolute top-24 right-24 md:right-40 w-24 h-24 rounded-full animate-in fade-in zoom-in duration-1000" style="box-shadow: inset -20px -15px 0 0 rgba(255,255,255,1); filter: drop-shadow(0 0 20px rgba(255,255,255,0.6)); transform: rotate(-20deg);"></div>
            <svg class="absolute bottom-0 left-0 w-full h-80 text-[#203A43]/50 opacity-80" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
            <svg class="absolute bottom-0 left-0 w-full h-64 text-[#0F2027]/80" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="currentColor" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,224C840,245,960,267,1080,261.3C1200,256,1320,224,1380,208L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>
          </div>
        } @else {
          <div class="absolute inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-1000 bg-gradient-to-b from-sky-100 via-white to-snow z-0">
             <div class="absolute top-24 right-24 md:right-32 w-32 h-32 animate-pulse">
               <div class="absolute -inset-24 bg-yellow-100/30 rounded-full blur-3xl"></div><div class="absolute -inset-12 bg-yellow-200/40 rounded-full blur-2xl"></div><div class="absolute -inset-4 bg-yellow-300/60 rounded-full blur-xl"></div><div class="absolute inset-0 bg-gradient-to-br from-white via-yellow-200 to-yellow-400 rounded-full shadow-[0_0_80px_rgba(253,224,71,1)] z-10"></div>
             </div>
             <svg class="absolute bottom-0 left-0 w-full h-[400px] text-sky-200/40 opacity-70" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
             <svg class="absolute bottom-0 left-0 w-full h-80 text-sky-100/80" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="currentColor" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,224C840,245,960,267,1080,261.3C1200,256,1320,224,1380,208L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>
             <svg class="absolute bottom-0 left-0 w-full h-48 text-white/95 drop-shadow-2xl" viewBox="0 0 1440 320" preserveAspectRatio="none"><path fill="currentColor" d="M0,256L80,245.3C160,235,320,213,480,213.3C640,213,800,235,960,234.7C1120,235,1280,213,1360,202.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path></svg>
          </div>
        }

        <div id="snow-container" class="fixed inset-0 pointer-events-none z-0"></div>

        <!-- Top Header Navigation (Theme Toggle & Logo) -->
        <header class="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl bg-white/30 dark:bg-arctic-dark/50 border-b border-black/5 dark:border-white/10">
          <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <a routerLink="/" class="text-3xl font-display font-bold tracking-wide text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-none cursor-pointer hover:scale-105 transition-transform">CRUX</a>
            <button (click)="toggleTheme()" class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors backdrop-blur-md">
              <mat-icon class="text-arctic-dark dark:text-yellow-300 text-sm md:text-base">{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
          </div>
        </header>

        <!-- Glass Login Panel -->
        <div class="glass-card bg-white/60 dark:bg-white/[0.03] border border-white/40 dark:border-white/5 w-full max-w-md p-10 rounded-3xl space-y-8 relative z-10 animate-in fade-in zoom-in duration-500 shadow-2xl">
          <div class="text-center">
            <h2 class="text-4xl font-display font-bold text-arctic-dark dark:text-white mb-2">Welcome Back</h2>
            <p class="text-arctic-mid/70 dark:text-white/60 text-sm">Please enter your details to sign in.</p>
          </div>

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="login()" class="space-y-4">
            <div class="space-y-2">
              <span class="block text-xs font-bold uppercase tracking-widest text-arctic-mid/80 dark:text-white/60 ml-1">Email Address</span>
              <div class="relative">
                <input formControlName="email" type="email" placeholder="explorer@crux.ai" class="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-arctic-dark dark:text-white placeholder-arctic-mid/40 dark:placeholder-white/30 focus:outline-none focus:border-sky-500 dark:focus:border-[#3FD5FF] focus:shadow-[0_0_15px_rgba(14,165,233,0.3)] dark:focus:shadow-[0_0_15px_rgba(63,213,255,0.3)] transition-all">
                @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                  <mat-icon class="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm w-5 h-5">error</mat-icon>
                }
              </div>
              @if (loginForm.get('email')?.errors?.['required'] && loginForm.get('email')?.touched) {
                <span class="text-xs text-red-500 ml-1">Email is required</span>
              }
              @if (loginForm.get('email')?.errors?.['email'] && loginForm.get('email')?.touched) {
                <span class="text-xs text-red-500 ml-1">Invalid email format</span>
              }
            </div>

            <div class="space-y-2">
              <span class="block text-xs font-bold uppercase tracking-widest text-arctic-mid/80 dark:text-white/60 ml-1">Password</span>
              <div class="relative">
                <input [type]="isPasswordVisible() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" class="w-full bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-arctic-dark dark:text-white placeholder-arctic-mid/40 dark:placeholder-white/30 focus:outline-none focus:border-sky-500 dark:focus:border-[#3FD5FF] focus:shadow-[0_0_15px_rgba(14,165,233,0.3)] dark:focus:shadow-[0_0_15px_rgba(63,213,255,0.3)] transition-all">
                <button type="button" (click)="togglePassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-arctic-mid/50 dark:text-white/40 hover:text-arctic-dark dark:hover:text-white transition-colors">
                  <mat-icon class="text-sm w-5 h-5 flex items-center justify-center">{{ isPasswordVisible() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (loginForm.get('password')?.errors?.['required'] && loginForm.get('password')?.touched) {
                <span class="text-xs text-red-500 ml-1">Password is required</span>
              }
            </div>
            
            <button type="submit" [disabled]="loginForm.invalid" class="w-full py-3 mt-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed" [ngClass]="isDarkMode() ? 'bg-gradient-to-r from-[#3FD5FF] via-white to-[#8e2de2] hover:shadow-[#3FD5FF]/50' : 'bg-gradient-to-r from-sky-400 via-sky-100 to-blue-600 hover:shadow-blue-500/50'">
              <mat-icon>login</mat-icon>
              Login
            </button>
          </form>

          <div class="relative py-2">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-black/10 dark:border-white/10"></div></div>
            <div class="relative flex justify-center text-[10px] uppercase tracking-widest"><span class="bg-white dark:bg-arctic-dark px-4 text-arctic-mid/60 dark:text-white/40 rounded-full">or continue with</span></div>
          </div>

          <!-- Social Logins -->
          <div class="grid grid-cols-2 gap-4">
            <button class="bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl p-3 flex justify-center items-center transition-colors gap-2 text-sm font-bold text-arctic-dark dark:text-white" title="Login with Google">
               <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
               Google
            </button>
            <button class="bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl p-3 flex justify-center items-center transition-colors gap-2 text-sm font-bold text-arctic-dark dark:text-white" title="Login with Telegram">
              <svg class="w-5 h-5 text-[#2AABEE]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
              Telegram
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-arctic-mid/70 dark:text-white/60">
              Don't have an account? 
              <a routerLink="/signup" class="text-sky-600 dark:text-[#3FD5FF] hover:underline font-bold">Sign Up</a>
            </p>
          </div>
        </div>

        <!-- Chatbot Interface -->
        <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          @if (isChatOpen()) {
            <div class="w-80 h-96 bg-white dark:bg-arctic-dark border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div class="p-4 text-slate-900 font-bold flex justify-between items-center shadow-md z-10" [ngClass]="isDarkMode() ? 'bg-gradient-to-r from-[#3FD5FF] via-white to-[#8e2de2]' : 'bg-gradient-to-r from-sky-400 via-sky-100 to-blue-600'">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-slate-900 text-lg w-5 h-5 flex items-center justify-center">smart_toy</mat-icon>
                  <span>Crux Assistant</span>
                </div>
                <button (click)="toggleChat()" class="hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-colors">
                  <mat-icon class="text-sm w-4 h-4 flex items-center justify-center">close</mat-icon>
                </button>
              </div>
              
              <div class="flex-1 p-4 bg-snow dark:bg-arctic-dark/50 overflow-y-auto flex flex-col gap-3 text-left">
                <div class="bg-white dark:bg-white/10 p-3 rounded-xl rounded-tl-none border border-black/5 dark:border-white/5 text-sm text-arctic-dark dark:text-white w-[85%] shadow-sm">
                  Hi! Need help signing in?
                </div>
              </div>
              
              <div class="p-3 border-t border-black/10 dark:border-white/10 bg-white dark:bg-arctic-dark flex items-center gap-2">
                <input type="text" placeholder="Type a message..." class="flex-1 bg-black/5 dark:bg-white/5 border border-transparent focus:border-sky-500 dark:focus:border-[#3FD5FF] rounded-lg px-3 py-2 text-sm text-arctic-dark dark:text-white outline-none transition-colors">
                <button class="text-sky-600 dark:text-[#3FD5FF] hover:scale-110 transition-transform">
                  <mat-icon class="w-6 h-6 flex items-center justify-center">send</mat-icon>
                </button>
              </div>
            </div>
          }

          <div (click)="toggleChat()" class="group cursor-pointer hover:scale-110 transition-transform duration-300 relative">
            <div class="relative w-16 h-16 md:w-20 md:h-20 bg-white/30 dark:bg-white/10 rounded-full backdrop-blur-md flex items-center justify-center border border-white/50 dark:border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-2xl">
              <div class="pingu-walking scale-[0.35] md:scale-50 -mt-2">
                <div class="pingu-container"><div class="pingu-body"><div class="pingu-hat"></div><div class="pingu-visor"><div class="pingu-visor-scan"></div></div><div class="pingu-belly"></div><div class="pingu-beak"></div><div class="pingu-wing left"></div><div class="pingu-wing right"></div><div class="pingu-foot left"></div><div class="pingu-foot right"></div></div></div>
              </div>
              <div class="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-sky-500 dark:bg-[#3FD5FF] rounded-full border-2 border-white dark:border-arctic-dark"></div>
            </div>
            <div class="absolute bottom-full right-0 mb-4 px-4 py-2 bg-arctic-dark dark:bg-white text-snow dark:text-arctic-dark rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
              Chat with Assistant
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit, OnDestroy {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  
  isDarkMode = signal(true);
  isChatOpen = signal(false);
  isPasswordVisible = signal(false);
  
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  private snowInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.createSnowflakes(true);
      this.snowInterval = setInterval(() => this.createSnowflakes(false), 5000);
    }
  }

  ngOnDestroy() {
    if (this.snowInterval) clearInterval(this.snowInterval);
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }

  toggleChat() {
    this.isChatOpen.update(v => !v);
  }

  togglePassword() {
    this.isPasswordVisible.update(v => !v);
  }

  login() {
    if (this.loginForm.valid) {
      this.router.navigate(['/onboarding']);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private createSnowflakes(isInitial: boolean = false) {
    const container = document.getElementById('snow-container');
    if (!container) return;

    const count = isInitial ? 30 : 10;
    for (let i = 0; i < count; i++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      const size = Math.random() * 4 + 2 + 'px';
      snowflake.style.width = size;
      snowflake.style.height = size;
      snowflake.style.left = Math.random() * 100 + 'vw';
      snowflake.style.animationDuration = (Math.random() * 5 + 5) + 's';
      if (isInitial) {
        snowflake.style.animationDelay = '-' + (Math.random() * 10) + 's';
      }
      snowflake.style.opacity = (Math.random() * 0.5 + 0.2).toString();
      snowflake.style.filter = 'blur(1px)';
      container.appendChild(snowflake);
      setTimeout(() => snowflake.remove(), isInitial ? 15000 : 10000);
    }
  }
}
