import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-onboarding',
  imports: [CommonModule, MatIconModule],
  template: `
    <div [class]="isDarkMode() ? 'dark' : ''">
      <div class="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-x-hidden overflow-y-auto transition-colors duration-1000 bg-snow dark:bg-arctic-dark font-sans text-arctic-dark dark:text-snow">
        
        <!-- Background Effects -->
        @if (isDarkMode()) {
          <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div class="aurora animate-in fade-in duration-1000"></div>
            <div class="neon-glow w-[600px] h-[600px] bg-[#3FD5FF]/10 -top-48 -left-48 animate-pulse"></div>
            <div class="neon-glow w-[500px] h-[500px] bg-[#8e2de2]/10 -bottom-32 -right-32 animate-pulse delay-1000"></div>
          </div>
        } @else {
          <div class="fixed inset-0 pointer-events-none overflow-hidden animate-in fade-in duration-1000 bg-gradient-to-b from-sky-100 via-white to-snow z-0">
             <div class="absolute top-24 right-24 md:right-32 w-32 h-32 animate-pulse">
               <div class="absolute -inset-24 bg-yellow-100/30 rounded-full blur-3xl"></div><div class="absolute -inset-12 bg-yellow-200/40 rounded-full blur-2xl"></div><div class="absolute -inset-4 bg-yellow-300/60 rounded-full blur-xl"></div><div class="absolute inset-0 bg-gradient-to-br from-white via-yellow-200 to-yellow-400 rounded-full shadow-[0_0_80px_rgba(253,224,71,1)] z-10"></div>
             </div>
          </div>
        }

        <div class="glass-card bg-white/60 dark:bg-white/[0.03] border border-white/40 dark:border-white/5 w-full max-w-2xl p-8 md:p-12 rounded-3xl space-y-8 relative z-10 animate-in fade-in zoom-in duration-500 shadow-2xl">
          <div class="text-center">
            <h2 class="text-4xl font-display font-bold text-arctic-dark dark:text-white mb-2">Let's Personalize CRUX</h2>
            <p class="text-arctic-mid/70 dark:text-white/60 text-sm">Help us tailor your AI summarization experience.</p>
          </div>

          <div class="space-y-6 mt-8">
            <!-- Q1 -->
            <div class="space-y-3">
              <span class="block text-xs font-bold uppercase tracking-widest text-arctic-mid/80 dark:text-white/60 ml-1">What platforms will you connect?</span>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                @for (opt of ['Telegram', 'Slack', 'Discord', 'Multiple']; track opt) {
                  <button (click)="responses.platforms = opt" [class]="responses.platforms === opt ? 'bg-sky-100 dark:bg-[#3FD5FF]/20 border-sky-500 dark:border-[#3FD5FF] text-sky-700 dark:text-[#3FD5FF] shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-sky-300 dark:hover:border-white/30 text-arctic-dark dark:text-white'" class="border rounded-xl p-3 text-sm font-bold transition-all">
                    {{opt}}
                  </button>
                }
              </div>
            </div>

            <!-- Q2 -->
            <div class="space-y-3">
              <span class="block text-xs font-bold uppercase tracking-widest text-arctic-mid/80 dark:text-white/60 ml-1">Primary Purpose</span>
              <div class="grid grid-cols-2 gap-3">
                @for (opt of ['Personal', 'Work/Business', 'Community Management', 'Study']; track opt) {
                  <button (click)="responses.primaryPurpose = opt" [class]="responses.primaryPurpose === opt ? 'bg-sky-100 dark:bg-[#3FD5FF]/20 border-sky-500 dark:border-[#3FD5FF] text-sky-700 dark:text-[#3FD5FF] shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-sky-300 dark:hover:border-white/30 text-arctic-dark dark:text-white'" class="border rounded-xl p-3 text-sm font-bold transition-all">
                    {{opt}}
                  </button>
                }
              </div>
            </div>

            <!-- Q3 -->
            <div class="space-y-3">
              <span class="block text-xs font-bold uppercase tracking-widest text-arctic-mid/80 dark:text-white/60 ml-1">Your Role</span>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                @for (opt of ['Developer', 'Manager', 'Student', 'Other']; track opt) {
                  <button (click)="responses.role = opt" [class]="responses.role === opt ? 'bg-sky-100 dark:bg-[#3FD5FF]/20 border-sky-500 dark:border-[#3FD5FF] text-sky-700 dark:text-[#3FD5FF] shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'bg-white dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-sky-300 dark:hover:border-white/30 text-arctic-dark dark:text-white'" class="border rounded-xl p-3 text-sm font-bold transition-all">
                    {{opt}}
                  </button>
                }
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 mt-10">
            <button (click)="skip()" class="flex-1 py-3 rounded-xl font-bold border border-black/10 dark:border-white/20 text-arctic-dark dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              Skip for now
            </button>
            <button (click)="save()" [disabled]="!isFormValid() || isSaving()" class="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed group" [ngClass]="isDarkMode() ? 'bg-gradient-to-r from-[#3FD5FF] via-white to-[#8e2de2] hover:shadow-[#3FD5FF]/50' : 'bg-gradient-to-r from-sky-400 via-sky-100 to-blue-600 hover:shadow-blue-500/50'">
              @if (isSaving()) {
                <mat-icon class="animate-spin">sync</mat-icon>
                Saving...
              } @else {
                Save & Continue
                <mat-icon class="group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon>
              }
            </button>
          </div>
          
          @if (errorMsg()) {
            <div class="text-red-500 text-sm text-center mt-4">{{ errorMsg() }}</div>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Onboarding implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  isDarkMode = signal(true);
  isSaving = signal(false);
  errorMsg = signal<string | null>(null);

  responses = {
    platforms: '',
    primaryPurpose: '',
    role: ''
  };

  ngOnInit() {
  }

  isFormValid() {
    return this.responses.platforms !== '' && this.responses.primaryPurpose !== '' && this.responses.role !== '';
  }

  skip() {
    this.router.navigate(['/platform-selection']);
  }

  save() {
    if (this.isFormValid()) {
      const user = this.authService.currentUser();
      if (!user || !user.email) {
         this.skip();
         return;
      }
      
      this.isSaving.set(true);
      const data = {
        email: user.email,
        platforms: this.responses.platforms,
        primaryPurpose: this.responses.primaryPurpose,
        role: this.responses.role
      };

      this.authService.saveOnboarding(data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/platform-selection']);
        },
        error: (err) => {
          console.error(err);
          this.errorMsg.set('Failed to save. You can skip for now.');
          this.isSaving.set(false);
        }
      });
    }
  }
}
