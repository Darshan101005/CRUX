import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-onboarding',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-arctic-dark">
      <!-- Background Effects -->
      <div class="ice-wave opacity-20 pointer-events-none"></div>
      <div class="neon-glow w-[600px] h-[600px] bg-ice-blue/10 -top-48 -right-48 animate-pulse"></div>
      <div class="neon-glow w-[500px] h-[500px] bg-neon-violet/5 -bottom-32 -left-32 animate-pulse delay-1000"></div>

      <!-- Content Container -->
      <div class="w-full max-w-4xl relative z-10">
        
        <!-- Progress Steps -->
        <div class="flex justify-center gap-4 mb-12 animate-in fade-in duration-1000">
          @for (step of [1, 2, 3, 4]; track step) {
            <div 
              class="w-12 h-1.5 rounded-full transition-all duration-700"
              [class]="currentStep() >= step ? 'bg-ice-blue shadow-[0_0_15px_rgba(63,213,255,0.8)]' : 'bg-white/10'"
            ></div>
          }
        </div>

        <div class="glass-panel p-10 md:p-20 overflow-hidden relative min-h-[500px] flex items-center">
          
          <!-- Step 1: Vision -->
          @if (currentStep() === 1) {
            <div class="w-full grid md:grid-cols-2 gap-12 items-center animate-in slide-in-from-right-20 duration-700">
              <div class="space-y-6">
                <div class="w-16 h-16 rounded-2xl bg-ice-blue/20 flex items-center justify-center border border-ice-blue/40">
                  <mat-icon class="text-4xl text-ice-blue">auto_awesome</mat-icon>
                </div>
                <h2 class="text-5xl font-display font-bold leading-tight">Your Digital <br> <span class="text-ice-blue">Command Center</span></h2>
                <p class="text-lg text-white/60 leading-relaxed">
                  CRUX connects your communication platforms and summarizes conversations using AI, 
                  helping you focus only on what truly matters.
                </p>
                <button (click)="next()" class="btn-primary px-12 group">
                  Begin Journey
                  <mat-icon class="group-hover:translate-x-2 transition-transform">east</mat-icon>
                </button>
              </div>
              <div class="hidden md:flex justify-center">
                <div class="w-64 h-64 rounded-full border-8 border-ice-blue/10 flex items-center justify-center relative">
                   <div class="absolute inset-0 border-t-8 border-ice-blue rounded-full animate-spin duration-[8s] linear infinite"></div>
                   <mat-icon class="text-8xl text-white opacity-20">hub</mat-icon>
                </div>
              </div>
            </div>
          }

          <!-- Step 2: Benefits -->
          @if (currentStep() === 2) {
            <div class="w-full space-y-10 animate-in slide-in-from-right-20 duration-700">
              <div class="text-center">
                <h2 class="text-4xl font-display font-bold mb-4">Why use <span class="text-ice-blue">CRUX?</span></h2>
                <p class="text-white/40">Efficiency meets Arctic intelligence.</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (benefit of benefits; track benefit.title) {
                  <div class="glass-card p-6 flex gap-5 group hover:bg-white/10 transition-all border-white/5 hover:border-ice-blue/30">
                    <div class="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shadow-inner group-hover:bg-ice-blue/20 transition-colors">
                      <mat-icon class="text-ice-blue">{{benefit.icon}}</mat-icon>
                    </div>
                    <div>
                      <h4 class="font-bold text-lg mb-1 group-hover:text-ice-blue transition-colors">{{benefit.title}}</h4>
                      <p class="text-sm text-white/40 leading-relaxed">{{benefit.description}}</p>
                    </div>
                  </div>
                }
              </div>
              <div class="flex justify-center pt-6">
                <button (click)="next()" class="btn-primary group">
                  Next Protocol
                  <mat-icon class="group-hover:translate-x-2 transition-transform">east</mat-icon>
                </button>
              </div>
            </div>
          }

          <!-- Step 3: Limits -->
          @if (currentStep() === 3) {
            <div class="w-full text-center space-y-10 animate-in slide-in-from-right-20 duration-700">
              <div class="w-24 h-24 rounded-full bg-neon-violet/20 flex items-center justify-center mx-auto border border-neon-violet/40 shadow-[0_0_30px_rgba(142,45,226,0.2)]">
                 <mat-icon class="text-5xl text-neon-violet">shield</mat-icon>
              </div>
              <h2 class="text-4xl font-display font-bold">Important Instructions</h2>
              <div class="max-w-xl mx-auto space-y-4">
                <div class="glass-card p-6 bg-white/[0.02] border-white/5 hover:border-ice-blue/30 transition-all text-left flex gap-6 items-center">
                  <span class="text-3xl font-display font-bold text-ice-blue/20">01</span>
                  <p class="text-sm text-white/80">You can connect <span class="text-ice-blue font-bold">only 1 app</span> for free.</p>
                </div>
                <div class="glass-card p-6 bg-white/[0.02] border-white/5 hover:border-ice-blue/30 transition-all text-left flex gap-6 items-center">
                  <span class="text-3xl font-display font-bold text-ice-blue/20">02</span>
                  <p class="text-sm text-white/80">Free tier includes <span class="text-ice-blue font-bold">limited daily summaries</span>.</p>
                </div>
                <div class="glass-card p-6 bg-white/[0.02] border-white/5 hover:border-ice-blue/30 transition-all text-left flex gap-6 items-center">
                  <span class="text-3xl font-display font-bold text-ice-blue/20">03</span>
                  <p class="text-sm text-white/80">Connect more platforms via <span class="text-ice-blue font-bold">Premium subscriptions</span>.</p>
                </div>
              </div>
              <button (click)="next()" class="btn-primary mt-8">I Accept the Protocol</button>
            </div>
          }

          <!-- Step 4: Questions -->
          @if (currentStep() === 4) {
            <div class="w-full grid md:grid-cols-2 gap-12 items-center animate-in slide-in-from-right-20 duration-700">
              <div class="space-y-6 text-center md:text-left relative">
                 <div class="absolute -top-24 -left-16 opacity-30 scale-50 hidden md:block">
                   <div class="pingu-walking">
                    <div class="pingu-container">
                      <div class="pingu-body">
                        <div class="pingu-hat"></div>
                        <div class="pingu-visor">
                          <div class="pingu-visor-scan"></div>
                        </div>
                        <div class="pingu-belly"></div>
                        <div class="pingu-beak"></div>
                        <div class="pingu-wing left"></div>
                        <div class="pingu-wing right"></div>
                        <div class="pingu-foot left"></div>
                        <div class="pingu-foot right"></div>
                      </div>
                    </div>
                   </div>
                 </div>
                 <h2 class="text-5xl font-display font-bold leading-tight">Personalize <br> <span class="text-ice-blue">Intelligence</span></h2>
                 <p class="text-white/40">Help us tailor the AI summaries to your specific workflow and needs.</p>
                 
                 <div class="hidden md:flex items-center gap-4 py-8">
                   <div class="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-bounce">
                     <mat-icon class="text-3xl text-ice-blue">psychology</mat-icon>
                   </div>
                   <div class="space-y-1">
                     <p class="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">AI Engine Active</p>
                     <p class="text-[8px] text-ice-blue animate-pulse">CALIBRATING NEURAL PATHWAYS...</p>
                   </div>
                 </div>
              </div>

              <div class="space-y-6">
                <!-- Q1 -->
                <div class="space-y-3">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Manage:</span>
                  <div class="grid grid-cols-2 gap-2">
                    @for (opt of ['Messages', 'Emails', 'Both']; track opt) {
                      <button (click)="responses.manage = opt" [class]="responses.manage === opt ? 'glass-card p-3 text-xs font-bold border-ice-blue bg-ice-blue/10 scale-[1.02] shadow-[0_0_20px_rgba(63,213,255,0.1)]' : 'glass-card p-3 text-xs opacity-60 hover:opacity-100 hover:border-white/20'">
                        {{opt}}
                      </button>
                    }
                  </div>
                </div>

                <!-- Q2 -->
                <div class="space-y-3">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Daily Platforms:</span>
                  <div class="grid grid-cols-3 gap-2">
                    @for (opt of ['1', '2', '3+']; track opt) {
                      <button (click)="responses.freq = opt" [class]="responses.freq === opt ? 'glass-card p-3 text-xs font-bold border-ice-blue bg-ice-blue/10 scale-[1.02] shadow-[0_0_20px_rgba(63,213,255,0.1)]' : 'glass-card p-3 text-xs opacity-60 hover:opacity-100 hover:border-white/20'">
                        {{opt}}
                      </button>
                    }
                  </div>
                </div>

                <!-- Q3 -->
                <div class="space-y-3">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Primary Goal:</span>
                  <div class="grid grid-cols-1 gap-2">
                    @for (opt of ['Save time', 'Track updates', 'Analyze conversations']; track opt) {
                      <button (click)="responses.goal = opt" [class]="responses.goal === opt ? 'glass-card p-3 text-left px-5 text-xs font-bold border-ice-blue bg-ice-blue/10 scale-[1.02] shadow-[0_0_20px_rgba(63,213,255,0.1)]' : 'glass-card p-3 text-left px-5 text-xs opacity-60 hover:opacity-100 hover:border-white/20'">
                        {{opt}}
                      </button>
                    }
                  </div>
                </div>

                <button 
                  (click)="finish()" 
                  [disabled]="!responses.manage || !responses.freq || !responses.goal"
                  class="btn-primary w-full py-4 mt-4 disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  Confirm Installation
                  <mat-icon class="group-hover:translate-x-2 transition-transform">rocket_launch</mat-icon>
                </button>
              </div>
            </div>
          }

        </div>
      </div>

      <!-- Penguin Walking Accent -->
      <div class="fixed bottom-10 left-10 pointer-events-none opacity-60 hidden lg:flex flex-col items-center">
         <div class="pingu-walking scale-75">
            <div class="pingu-container">
              <div class="pingu-body">
                <div class="pingu-hat"></div>
                <div class="pingu-visor">
                  <div class="pingu-visor-scan"></div>
                </div>
                <div class="pingu-belly"></div>
                <div class="pingu-beak"></div>
                <div class="pingu-wing left"></div>
                <div class="pingu-wing right"></div>
                <div class="pingu-foot left"></div>
                <div class="pingu-foot right"></div>
              </div>
            </div>
          </div>
         <div class="flex gap-1.5 mt-2">
           <div class="w-1.5 h-1.5 bg-ice-blue/40 rounded-full animate-bounce"></div>
           <div class="w-1.5 h-1.5 bg-ice-blue/40 rounded-full animate-bounce delay-100"></div>
           <div class="w-1.5 h-1.5 bg-ice-blue/40 rounded-full animate-bounce delay-200"></div>
         </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-in {
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Onboarding {
  private router = inject(Router);

  currentStep = signal(1);

  benefits = [
    { title: 'Save time', icon: 'timer', description: 'Distill hours of reading into minutes.' },
    { title: 'Avoid overload', icon: 'psychology', description: 'Filter out the noise and focus on crucial signals.' },
    { title: 'Improve productivity', icon: 'bolt', description: 'Never miss an critical update or action item.' },
    { title: 'Smart insights', icon: 'lightbulb', description: 'Gain intelligence from your communication data.' },
  ];

  responses = {
    manage: '',
    freq: '',
    goal: ''
  };

  next() {
    this.currentStep.update(s => s + 1);
  }

  finish() {
    console.log('Onboarding complete:', this.responses);
    this.router.navigate(['/platform-selection']);
  }
}
