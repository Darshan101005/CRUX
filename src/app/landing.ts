import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ThemeService } from './theme.service';

interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

@Component({
  standalone: true,
  selector: 'app-landing',
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div [class]="themeService.isDarkMode() ? 'dark' : ''">
      <!-- Main Container -->
      <div class="relative min-h-screen flex flex-col transition-colors duration-1000 overflow-x-hidden bg-snow dark:bg-arctic-dark text-arctic-dark dark:text-snow font-sans">
        
        <!-- Background Effects (Theme Dependent) -->
        @if (themeService.isDarkMode()) {
          <!-- Arctic Night Landscape -->
          <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div class="aurora animate-in fade-in duration-1000"></div>
            <div class="neon-glow w-[600px] h-[600px] bg-[#3FD5FF]/10 -top-48 -left-48 animate-pulse"></div>
            <div class="neon-glow w-[500px] h-[500px] bg-[#8e2de2]/10 -bottom-32 -right-32 animate-pulse delay-1000"></div>
            
            <!-- Elegant Crescent Moon -->
            <div class="absolute top-24 right-24 md:right-40 w-24 h-24 rounded-full animate-in fade-in zoom-in duration-1000" style="box-shadow: inset -20px -15px 0 0 rgba(255,255,255,1); filter: drop-shadow(0 0 20px rgba(255,255,255,0.6)); transform: rotate(-20deg);">
            </div>
            
            <!-- Night Mountains -->
            <svg class="absolute bottom-0 left-0 w-full h-80 text-[#203A43]/50 opacity-80" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <svg class="absolute bottom-0 left-0 w-full h-64 text-[#0F2027]/80" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,224C840,245,960,267,1080,261.3C1200,256,1320,224,1380,208L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
          </div>
        } @else {
          <!-- Arctic Day Landscape -->
          <div class="absolute inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-1000 bg-gradient-to-b from-sky-100 via-white to-snow z-0">
             
             <!-- Improved Radiant Sun -->
             <div class="absolute top-24 right-24 md:right-32 w-32 h-32 animate-pulse">
               <!-- Glowing rays -->
               <div class="absolute -inset-24 bg-yellow-100/30 rounded-full blur-3xl"></div>
               <div class="absolute -inset-12 bg-yellow-200/40 rounded-full blur-2xl"></div>
               <div class="absolute -inset-4 bg-yellow-300/60 rounded-full blur-xl"></div>
               <!-- Core -->
               <div class="absolute inset-0 bg-gradient-to-br from-white via-yellow-200 to-yellow-400 rounded-full shadow-[0_0_80px_rgba(253,224,71,1)] z-10"></div>
             </div>

             <!-- Improved Layered Mountains -->
             <!-- Mountains Layer 1 (Back) -->
             <svg class="absolute bottom-0 left-0 w-full h-[400px] text-sky-200/40 opacity-70" viewBox="0 0 1440 320" preserveAspectRatio="none">
               <path fill="currentColor" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
             </svg>
             <!-- Mountains Layer 2 (Middle) -->
             <svg class="absolute bottom-0 left-0 w-full h-80 text-sky-100/80" viewBox="0 0 1440 320" preserveAspectRatio="none">
               <path fill="currentColor" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,224C840,245,960,267,1080,261.3C1200,256,1320,224,1380,208L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
             </svg>
             <!-- Mountains Layer 3 (Front Snow) -->
             <svg class="absolute bottom-0 left-0 w-full h-48 text-white/95 drop-shadow-2xl" viewBox="0 0 1440 320" preserveAspectRatio="none">
               <path fill="currentColor" d="M0,256L80,245.3C160,235,320,213,480,213.3C640,213,800,235,960,234.7C1120,235,1280,213,1360,202.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
             </svg>
          </div>
        }
        
        <div id="snow-container" class="fixed inset-0 pointer-events-none z-0"></div>

        <!-- Glass Header -->
        <header class="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl bg-white/30 dark:bg-arctic-dark/50 border-b border-black/5 dark:border-white/10">
          <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <!-- Plain White/Black Logo -->
            <div class="flex items-center gap-2">
              <span class="text-3xl font-display font-bold tracking-wide text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-none">
                CRUX
              </span>
            </div>

            <!-- Header Actions -->
            <div class="flex items-center gap-2 md:gap-4">
              <!-- Theme Toggle -->
              <button (click)="themeService.toggleTheme()" class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors backdrop-blur-md">
                <mat-icon class="text-arctic-dark dark:text-yellow-300 text-sm md:text-base">
                  {{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}
                </mat-icon>
              </button>
              
              <a routerLink="/login" class="px-4 py-2 font-bold rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors hidden sm:block text-sm md:text-base text-arctic-dark dark:text-white">
                Log In
              </a>
              <a routerLink="/signup" class="bg-gradient-to-r from-sky-400 via-sky-100 to-blue-600 dark:from-[#3FD5FF] dark:via-white dark:to-[#8e2de2] text-slate-900 font-bold py-2 px-4 md:py-2.5 md:px-6 rounded-xl shadow-lg hover:shadow-[#3FD5FF]/50 hover:scale-[1.02] active:scale-95 transition-all text-sm md:text-base">
                Sign Up
              </a>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="relative z-10 w-full max-w-7xl mx-auto px-6 flex-1 flex flex-col items-center text-center">

          <!-- Hero Section Wrapper (Guaranteed to fit in screen without scroll) -->
          <div class="w-full min-h-[calc(100vh-80px)] mt-20 flex flex-col items-center justify-center pb-10">
            <h1 class="text-6xl md:text-8xl lg:text-[9rem] font-display font-bold leading-none mb-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              <span class="text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-none tracking-tight">CRUX</span> <br>
              <!-- Proper Clean Gradients -->
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 dark:from-[#3FD5FF] dark:via-white dark:to-[#8e2de2] animate-gradient-x tracking-tight">Signal 01</span>
            </h1>

            <p class="text-lg md:text-2xl text-arctic-mid/80 dark:text-white/70 max-w-3xl mb-10 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 backdrop-blur-sm bg-white/10 dark:bg-transparent p-4 md:p-0 rounded-2xl">
              The ultimate Arctic layer for your communications. We distill <span class="font-bold text-arctic-dark dark:text-white">Signal</span> from <span class="italic text-arctic-mid/60 dark:text-white/50">Noise</span> across all your primary platforms.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
              <a routerLink="/signup" class="bg-gradient-to-r from-sky-400 via-sky-100 to-blue-600 dark:from-[#3FD5FF] dark:via-white dark:to-[#8e2de2] text-slate-900 w-64 h-14 md:w-72 md:h-16 text-lg font-bold rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(63,213,255,0.4)] hover:shadow-[0_0_50px_rgba(142,45,226,0.6)] hover:scale-[1.02] active:scale-95 transition-all group">
                Start Summarizing
                <mat-icon class="group-hover:translate-x-2 transition-transform">east</mat-icon>
              </a>
            </div>
          </div>

          <!-- How It Works Section -->
          <section class="w-full text-left py-20 animate-in fade-in duration-1000 delay-700">
            <div class="text-center mb-16">
              <h2 class="text-4xl md:text-5xl font-display font-bold text-arctic-dark dark:text-white mb-4">How it Works</h2>
              <p class="text-arctic-mid/70 dark:text-white/60 text-lg max-w-2xl mx-auto">Three simple steps to reclaim your time and focus on what truly matters.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <!-- Connecting Line (Desktop only) -->
              <div class="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#3FD5FF]/20 via-[#8e2de2]/20 to-[#3FD5FF]/20 -z-10"></div>
              
              <!-- Cards with numbers perfectly centered vertically on right edge, inside card -->
              <div class="glass-card bg-white/60 dark:bg-white/[0.03] border border-white/40 dark:border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:shadow-2xl dark:hover:shadow-[0_0_40px_rgba(63,213,255,0.15)] transition-all">
                <div class="absolute top-2 right-6 text-[120px] leading-none font-black text-black/5 dark:text-white/5 group-hover:scale-110 group-hover:text-black/10 dark:group-hover:text-white/10 transition-all duration-700 select-none z-0">1</div>
                <div class="w-14 h-14 rounded-2xl bg-[#3FD5FF]/20 flex items-center justify-center mb-6 relative z-10">
                  <mat-icon class="text-[#3FD5FF] text-3xl w-8 h-8 flex items-center justify-center">hub</mat-icon>
                </div>
                <h3 class="text-2xl font-bold mb-4 text-arctic-dark dark:text-white relative z-10 w-3/4">Connect Platforms</h3>
                <p class="text-arctic-mid/70 dark:text-white/60 relative z-10 w-4/5">Securely link your preferred communication channels with just a few clicks. We handle the rest.</p>
              </div>

              <div class="glass-card bg-white/60 dark:bg-white/[0.03] border border-white/40 dark:border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:shadow-2xl dark:hover:shadow-[0_0_40px_rgba(142,45,226,0.15)] transition-all md:-translate-y-8">
                <div class="absolute top-2 right-6 text-[120px] leading-none font-black text-black/5 dark:text-white/5 group-hover:scale-110 group-hover:text-black/10 dark:group-hover:text-white/10 transition-all duration-700 select-none z-0">2</div>
                <div class="w-14 h-14 rounded-2xl bg-[#8e2de2]/20 flex items-center justify-center mb-6 relative z-10">
                  <mat-icon class="text-[#8e2de2] text-3xl w-8 h-8 flex items-center justify-center">psychology</mat-icon>
                </div>
                <h3 class="text-2xl font-bold mb-4 text-arctic-dark dark:text-white relative z-10 w-3/4">AI Processing</h3>
                <p class="text-arctic-mid/70 dark:text-white/60 relative z-10 w-4/5">Our advanced LLMs continuously monitor and analyze conversations in the background.</p>
              </div>

              <div class="glass-card bg-white/60 dark:bg-white/[0.03] border border-white/40 dark:border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:shadow-2xl dark:hover:shadow-[0_0_40px_rgba(63,213,255,0.15)] transition-all">
                <div class="absolute top-2 right-6 text-[120px] leading-none font-black text-black/5 dark:text-white/5 group-hover:scale-110 group-hover:text-black/10 dark:group-hover:text-white/10 transition-all duration-700 select-none z-0">3</div>
                <div class="w-14 h-14 rounded-2xl bg-[#3FD5FF]/20 flex items-center justify-center mb-6 relative z-10">
                  <mat-icon class="text-[#3FD5FF] text-3xl w-8 h-8 flex items-center justify-center">auto_awesome</mat-icon>
                </div>
                <h3 class="text-2xl font-bold mb-4 text-arctic-dark dark:text-white relative z-10 w-3/4">Get Summaries</h3>
                <p class="text-arctic-mid/70 dark:text-white/60 relative z-10 w-4/5">Receive beautiful, actionable digests highlighting only what's important to you.</p>
              </div>
            </div>
          </section>

          <!-- Pricing Section -->
          <section class="w-full py-20 mb-10">
            <div class="text-center mb-16 relative z-20">
              <h2 class="text-4xl md:text-5xl font-display font-bold text-arctic-dark dark:text-white mb-4">Simple Pricing</h2>
              <p class="text-arctic-mid/70 dark:text-white/60 text-lg max-w-2xl mx-auto mb-8">Choose the plan that fits your communication volume.</p>
              
              <!-- Currency Selector Dropdown -->
              <div class="relative inline-block text-left">
                <button (click)="toggleCurrencyDropdown()" class="inline-flex items-center justify-center w-40 px-4 py-2 text-sm font-bold text-arctic-dark dark:text-white bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors shadow-sm focus:outline-none">
                  <mat-icon class="text-[18px] w-5 h-5 mr-2">payments</mat-icon>
                  {{selectedCurrency().code}} ({{selectedCurrency().symbol}})
                  <mat-icon class="text-[18px] w-5 h-5 ml-2">expand_more</mat-icon>
                </button>
                
                <!-- Dropdown Menu -->
                @if (isCurrencyDropdownOpen()) {
                  <div class="absolute left-1/2 -translate-x-1/2 z-50 mt-2 w-48 origin-top rounded-xl bg-white dark:bg-arctic-dark shadow-2xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                    <div class="py-1">
                      @for (curr of currencies; track curr.code) {
                        <button (click)="selectCurrency(curr)" class="group flex w-full items-center px-4 py-2 text-sm text-arctic-dark dark:text-white hover:bg-blue-50 dark:hover:bg-white/10 transition-colors">
                          <span class="w-8 font-bold text-sky-600 dark:text-[#3FD5FF]">{{curr.symbol}}</span>
                          {{curr.code}}
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              <!-- Free Tier -->
              <div class="glass-card bg-white/60 dark:bg-white/[0.02] border border-black/10 dark:border-white/5 p-8 rounded-3xl flex flex-col text-left">
                <h3 class="text-xl font-bold text-arctic-dark dark:text-white mb-2">Basic</h3>
                <p class="text-arctic-mid/60 dark:text-white/50 text-sm mb-6">Perfect for individuals</p>
                <div class="mb-8">
                  <span class="text-5xl font-display font-bold text-arctic-dark dark:text-white">{{selectedCurrency().symbol}}0</span>
                  <span class="text-arctic-mid/60 dark:text-white/50">/month</span>
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-[#3FD5FF] text-sm w-5 h-5">check_circle</mat-icon> 100 Summaries per month
                  </li>
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-[#3FD5FF] text-sm w-5 h-5">check_circle</mat-icon> 2 Platform connections
                  </li>
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-[#3FD5FF] text-sm w-5 h-5">check_circle</mat-icon> Standard support
                  </li>
                </ul>
                <a routerLink="/signup" class="w-full py-3 rounded-xl border border-black/10 dark:border-white/10 text-center font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-arctic-dark dark:text-white">Get Started</a>
              </div>

              <!-- Pro Tier -->
              <div class="glass-card bg-white dark:bg-white/[0.05] border border-[#3FD5FF]/50 p-8 rounded-3xl flex flex-col text-left relative transform md:-translate-y-4 shadow-xl dark:shadow-[0_0_30px_rgba(63,213,255,0.15)] z-10">
                <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-sky-400 via-sky-100 to-blue-600 dark:from-[#3FD5FF] dark:via-white dark:to-[#8e2de2] text-slate-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">Most Popular</div>
                <h3 class="text-xl font-bold text-arctic-dark dark:text-white mb-2">Pro</h3>
                <p class="text-arctic-mid/60 dark:text-white/50 text-sm mb-6">For busy professionals</p>
                <div class="mb-8">
                  <span class="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-100 to-blue-600 dark:from-[#3FD5FF] dark:via-white dark:to-[#8e2de2]">{{selectedCurrency().symbol}}{{formatPrice(9.99)}}</span>
                  <span class="text-arctic-mid/60 dark:text-white/50">/month</span>
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-sky-600 dark:text-[#8e2de2] text-sm w-5 h-5">check_circle</mat-icon> Unlimited Summaries
                  </li>
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-sky-600 dark:text-[#8e2de2] text-sm w-5 h-5">check_circle</mat-icon> Unlimited Platforms
                  </li>
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-sky-600 dark:text-[#8e2de2] text-sm w-5 h-5">check_circle</mat-icon> Priority support
                  </li>
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-sky-600 dark:text-[#8e2de2] text-sm w-5 h-5">check_circle</mat-icon> Advanced keyword alerts
                  </li>
                </ul>
                <a routerLink="/signup" class="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 via-sky-100 to-blue-600 dark:from-[#3FD5FF] dark:via-white dark:to-[#8e2de2] text-slate-900 text-center font-bold hover:scale-[1.02] transition-transform shadow-lg">Upgrade to Pro</a>
              </div>

              <!-- Elite Tier -->
              <div class="glass-card bg-white/60 dark:bg-white/[0.02] border border-black/10 dark:border-white/5 p-8 rounded-3xl flex flex-col text-left">
                <h3 class="text-xl font-bold text-arctic-dark dark:text-white mb-2">Elite</h3>
                <p class="text-arctic-mid/60 dark:text-white/50 text-sm mb-6">For teams and enterprise</p>
                <div class="mb-8">
                  <span class="text-5xl font-display font-bold text-arctic-dark dark:text-white">{{selectedCurrency().symbol}}{{formatPrice(24.99)}}</span>
                  <span class="text-arctic-mid/60 dark:text-white/50">/month</span>
                </div>
                <ul class="space-y-4 mb-8 flex-1">
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-[#3FD5FF] text-sm w-5 h-5">check_circle</mat-icon> Everything in Pro
                  </li>
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-[#3FD5FF] text-sm w-5 h-5">check_circle</mat-icon> API Access
                  </li>
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-[#3FD5FF] text-sm w-5 h-5">check_circle</mat-icon> Team collaboration
                  </li>
                  <li class="flex items-center gap-3 text-sm text-arctic-mid/80 dark:text-white/70">
                    <mat-icon class="text-[#3FD5FF] text-sm w-5 h-5">check_circle</mat-icon> Dedicated account manager
                  </li>
                </ul>
                <a routerLink="/signup" class="w-full py-3 rounded-xl border border-black/10 dark:border-white/10 text-center font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-arctic-dark dark:text-white">Contact Sales</a>
              </div>

            </div>
          </section>

          <!-- Additional Value Props / Grid -->
          <section class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-20 text-left">
            <div class="glass-card bg-white/60 dark:bg-white/[0.03] border border-black/10 dark:border-white/5 p-10 rounded-3xl flex flex-col justify-center">
              <mat-icon class="text-[#3FD5FF] text-4xl mb-6">shield</mat-icon>
              <h3 class="text-2xl font-bold text-arctic-dark dark:text-white mb-4">Bank-Grade Security</h3>
              <p class="text-arctic-mid/70 dark:text-white/60 leading-relaxed">Your data is encrypted at rest and in transit. We never sell your personal information or use your private conversations to train public models.</p>
            </div>
            <div class="glass-card bg-white/60 dark:bg-white/[0.03] border border-black/10 dark:border-white/5 p-10 rounded-3xl flex flex-col justify-center">
              <mat-icon class="text-[#8e2de2] text-4xl mb-6">bolt</mat-icon>
              <h3 class="text-2xl font-bold text-arctic-dark dark:text-white mb-4">Lightning Fast</h3>
              <p class="text-arctic-mid/70 dark:text-white/60 leading-relaxed">Summaries are generated in milliseconds. Wake up to a perfectly organized digest of what happened while you were away, across all timezones.</p>
            </div>
          </section>

        </main>

        <!-- Expanded Footer (Tightened bottom padding) -->
        <footer class="relative z-10 w-full border-t border-black/10 dark:border-white/10 bg-white/40 dark:bg-arctic-dark/90 backdrop-blur-xl mt-auto pt-16 px-6">
          <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
            
            <!-- Brand Column -->
            <div class="col-span-1 md:col-span-1 flex flex-col gap-4">
              <!-- Plain CRUX logo here too -->
              <span class="text-3xl font-display font-bold tracking-wide text-slate-800 dark:text-white mb-2">
                CRUX
              </span>
              <p class="text-sm text-arctic-mid/70 dark:text-white/50 leading-relaxed">
                The ultimate Arctic layer for your communications. Distilling signal from noise.
              </p>
              
              <!-- Real Social Icons -->
              <div class="flex gap-4 mt-4">
                <!-- X (Twitter) -->
                <a href="#" class="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-[#3FD5FF]/20 text-arctic-dark dark:text-white hover:text-[#3FD5FF] transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <!-- Facebook -->
                <a href="#" class="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-[#8e2de2]/20 text-arctic-dark dark:text-white hover:text-[#8e2de2] transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <!-- Instagram -->
                <a href="#" class="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-[#8e2de2]/20 text-arctic-dark dark:text-white hover:text-[#8e2de2] transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <!-- Telegram -->
                <a href="#" class="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-[#3FD5FF]/20 text-arctic-dark dark:text-white hover:text-[#3FD5FF] transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
                </a>
              </div>
            </div>

            <!-- Links Columns -->
            <div>
              <h4 class="font-bold text-arctic-dark dark:text-white mb-6 uppercase tracking-wider text-sm">Product</h4>
              <ul class="space-y-4 text-sm text-arctic-mid/70 dark:text-white/60">
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Features</a></li>
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Integrations</a></li>
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Pricing</a></li>
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-bold text-arctic-dark dark:text-white mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul class="space-y-4 text-sm text-arctic-mid/70 dark:text-white/60">
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">About Us</a></li>
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Careers</a></li>
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Blog</a></li>
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-bold text-arctic-dark dark:text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul class="space-y-4 text-sm text-arctic-mid/70 dark:text-white/60">
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Privacy Policy</a></li>
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Terms of Service</a></li>
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Cookie Policy</a></li>
                <li><a href="#" class="hover:text-sky-600 dark:hover:text-[#3FD5FF] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <!-- Bottom Bar -->
          <div class="max-w-7xl mx-auto py-6 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <span class="text-sm text-arctic-mid/60 dark:text-white/40">© 2026 Signal 01. All rights reserved.</span>
            
            <!-- IP Info Display -->
            <div class="flex items-center gap-2 text-xs text-arctic-dark/80 dark:text-white/60 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full font-mono shadow-sm dark:shadow-none border border-black/5 dark:border-white/5">
              <mat-icon class="text-[16px] w-4 h-4 text-sky-600 dark:text-[#3FD5FF]">location_on</mat-icon>
              @if (ipInfo()) {
                <span>{{ipInfo()?.city}}, {{ipInfo()?.country}} • IP: {{ipInfo()?.query}}</span>
              } @else {
                <span class="animate-pulse">Detecting location...</span>
              }
            </div>
          </div>
        </footer>

        <!-- Chatbot Interface -->
        <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          
          <!-- Chat Window -->
          @if (isChatOpen()) {
            <div class="w-80 h-96 bg-white dark:bg-arctic-dark border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div class="bg-gradient-to-r from-sky-400 via-sky-100 to-blue-600 dark:from-[#3FD5FF] dark:via-white dark:to-[#8e2de2] p-4 text-slate-900 font-bold flex justify-between items-center shadow-md z-10">
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
                  Hi! How can I help you understand CRUX today?
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

          <!-- Chat Icon Container -->
          <div (click)="toggleChat()" class="group cursor-pointer hover:scale-110 transition-transform duration-300 relative">
            <div class="relative w-16 h-16 md:w-20 md:h-20 bg-white/30 dark:bg-white/10 rounded-full backdrop-blur-md flex items-center justify-center border border-white/50 dark:border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-2xl">
              <!-- Pingu Mascot -->
              <div class="pingu-walking scale-[0.35] md:scale-50 -mt-2">
                <div class="pingu-container">
                  <div class="pingu-body">
                    <div class="pingu-hat"></div>
                    <div class="pingu-visor"><div class="pingu-visor-scan"></div></div>
                    <div class="pingu-belly"></div>
                    <div class="pingu-beak"></div>
                    <div class="pingu-wing left"></div>
                    <div class="pingu-wing right"></div>
                    <div class="pingu-foot left"></div>
                    <div class="pingu-foot right"></div>
                  </div>
                </div>
              </div>
              
              <!-- Notification Dot -->
              <div class="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-sky-500 dark:bg-[#3FD5FF] rounded-full border-2 border-white dark:border-arctic-dark"></div>
            </div>
            <!-- Tooltip -->
            <div class="absolute bottom-full right-0 mb-4 px-4 py-2 bg-arctic-dark dark:bg-white text-snow dark:text-arctic-dark rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
              Chat with Assistant
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  public themeService = inject(ThemeService);
  
  ipInfo = signal<any>(null);
  isChatOpen = signal(false);

  currencies: Currency[] = [
    { code: 'USD', symbol: '$', rate: 1 },
    { code: 'EUR', symbol: '€', rate: 0.92 },
    { code: 'GBP', symbol: '£', rate: 0.79 },
    { code: 'INR', symbol: '₹', rate: 83.5 },
    { code: 'AUD', symbol: 'A$', rate: 1.52 },
    { code: 'CAD', symbol: 'C$', rate: 1.37 },
    { code: 'JPY', symbol: '¥', rate: 155.0 },
    { code: 'CHF', symbol: 'Fr', rate: 0.91 },
    { code: 'CNY', symbol: '¥', rate: 7.24 },
    { code: 'SGD', symbol: 'S$', rate: 1.35 },
  ];
  
  selectedCurrency = signal<Currency>(this.currencies[0]);
  isCurrencyDropdownOpen = signal(false);

  private snowInterval: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Create initial batch of snowflakes so screen is filled instantly
      this.createSnowflakes(true);
      this.snowInterval = setInterval(() => this.createSnowflakes(false), 5000);
      this.fetchIpInfo();
    }
  }

  ngOnDestroy() {
    if (this.snowInterval) clearInterval(this.snowInterval);
  }
  
  toggleChat() {
    this.isChatOpen.update(v => !v);
  }

  toggleCurrencyDropdown() {
    this.isCurrencyDropdownOpen.update(v => !v);
  }

  selectCurrency(curr: Currency) {
    this.selectedCurrency.set(curr);
    this.isCurrencyDropdownOpen.set(false);
  }

  formatPrice(baseUsd: number): string {
    const curr = this.selectedCurrency();
    const converted = baseUsd * curr.rate;
    return converted % 1 === 0 ? converted.toString() : converted.toFixed(2);
  }

  private async fetchIpInfo() {
    try {
      const response = await fetch('http://ip-api.com/json/');
      if (response.ok) {
        const data = await response.json();
        this.ipInfo.set(data);
      }
    } catch (e) {
      console.error('Failed to fetch IP info', e);
    }
  }

  private createSnowflakes(isInitial: boolean = false) {
    const container = document.getElementById('snow-container');
    if (!container) return;

    const count = isInitial ? 40 : 15;

    for (let i = 0; i < count; i++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      const size = Math.random() * 4 + 2 + 'px';
      snowflake.style.width = size;
      snowflake.style.height = size;
      snowflake.style.left = Math.random() * 100 + 'vw';
      
      const duration = Math.random() * 5 + 5;
      snowflake.style.animationDuration = duration + 's';
      
      if (isInitial) {
        // Safe string interpolation logic without backticks
        const randomDelay = Math.random() * 10;
        snowflake.style.animationDelay = '-' + randomDelay + 's';
      }
      
      snowflake.style.opacity = (Math.random() * 0.5 + 0.2).toString();
      snowflake.style.filter = 'blur(1px)';
      
      container.appendChild(snowflake);

      // Clean up DOM safely
      setTimeout(() => snowflake.remove(), isInitial ? 15000 : 10000);
    }
  }
}
