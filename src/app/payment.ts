import {ChangeDetectionStrategy, Component, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, Router} from '@angular/router';
import {PlanService, UserTier} from './plan.service';

@Component({
  standalone: true,
  selector: 'app-payment',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 py-12">
      <div class="text-center space-y-4">
        <h2 class="text-4xl font-display">Complete Your Upgrade</h2>
        <p class="text-white/40">You've selected the <span class="text-wave-start font-bold uppercase tracking-widest">{{planName()}}</span> plan.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Payment Form -->
        <div class="glass-panel p-8 space-y-8">
          <h3 class="text-xl">Payment Method</h3>
          
          <div class="space-y-4">
            <div class="flex gap-4">
              <button class="flex-1 p-4 rounded-xl border border-wave-start bg-wave-start/10 flex flex-col items-center gap-2">
                <mat-icon class="text-wave-start">credit_card</mat-icon>
                <span class="text-xs font-bold uppercase tracking-widest">Card</span>
              </button>
              <button class="flex-1 p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center gap-2 opacity-50">
                <mat-icon>account_balance</mat-icon>
                <span class="text-xs font-bold uppercase tracking-widest">PayPal</span>
              </button>
              <button class="flex-1 p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center gap-2 opacity-50">
                <mat-icon>apple</mat-icon>
                <span class="text-xs font-bold uppercase tracking-widest">Apple Pay</span>
              </button>
            </div>

            <div class="space-y-4 pt-4">
              <div class="space-y-2">
                <span class="block text-[10px] font-bold uppercase tracking-widest text-white/40">Cardholder Name</span>
                <input type="text" placeholder="John Doe" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-wave-start transition-all">
              </div>
              <div class="space-y-2">
                <span class="block text-[10px] font-bold uppercase tracking-widest text-white/40">Card Number</span>
                <div class="relative">
                  <input type="text" placeholder="**** **** **** ****" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-wave-start transition-all">
                  <mat-icon class="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">lock</mat-icon>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <span class="block text-[10px] font-bold uppercase tracking-widest text-white/40">Expiry Date</span>
                  <input type="text" placeholder="MM/YY" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-wave-start transition-all">
                </div>
                <div class="space-y-2">
                  <span class="block text-[10px] font-bold uppercase tracking-widest text-white/40">CVV</span>
                  <input type="text" placeholder="***" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-wave-start transition-all">
                </div>
              </div>
            </div>
          </div>

          <button (click)="processPayment()" class="btn-primary w-full justify-center py-4 text-lg">
            @if (isProcessing()) {
              <mat-icon class="animate-spin">sync</mat-icon>
              Processing...
            } @else {
              Pay {{planPrice()}}
            }
          </button>
          
          <p class="text-[10px] text-center text-white/20">
            By clicking "Pay", you agree to our Terms of Service and Privacy Policy. 
            Your payment is secured with 256-bit SSL encryption.
          </p>
        </div>

        <!-- Order Summary -->
        <div class="space-y-8">
          <div class="glass-panel p-8">
            <h3 class="text-xl mb-6">Order Summary</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-white/60">CRUX {{planName()}} (Monthly)</span>
                <span class="font-bold">{{planPrice()}}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-white/60">Tax (0%)</span>
                <span class="font-bold">$0.00</span>
              </div>
              <div class="h-[1px] bg-white/10 my-4"></div>
              <div class="flex justify-between items-center text-xl">
                <span class="font-display">Total Due</span>
                <span class="text-wave-start font-bold">{{planPrice()}}</span>
              </div>
            </div>
          </div>

          <div class="glass-card p-6 border-wave-start/20 bg-wave-start/5">
            <div class="flex gap-4">
              <mat-icon class="text-wave-start">verified</mat-icon>
              <div>
                <h4 class="font-semibold text-sm">Money-Back Guarantee</h4>
                <p class="text-xs text-white/60">Not satisfied? Get a full refund within 14 days of your purchase. No questions asked.</p>
              </div>
            </div>
          </div>

          <button (click)="goBack()" class="text-sm text-ice-blue hover:underline flex items-center gap-2">
            <mat-icon class="text-sm">arrow_back</mat-icon>
            Back to Plans
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    @if (showSuccess()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-arctic-dark/80 backdrop-blur-md">
        <div class="glass-panel p-12 max-w-md w-full text-center space-y-6 animate-in zoom-in duration-500">
          <div class="w-20 h-20 rounded-full bg-wave-start/20 flex items-center justify-center mx-auto border border-wave-start/40">
            <mat-icon class="text-wave-start text-5xl">check</mat-icon>
          </div>
          <h2 class="text-3xl font-display">Upgrade Successful!</h2>
          <p class="text-white/60">Welcome to the <span class="text-wave-start font-bold">{{planName()}}</span> tier. Your payment of <span class="text-white font-bold">{{planPrice()}}</span> matches our records. Your new features are now active.</p>
          <button (click)="goToDashboard()" class="btn-primary w-full justify-center">
            Go to Dashboard
          </button>
        </div>
      </div>
    }
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
    .zoom-in {
      animation: zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes zoomIn {
      from { opacity: 0; scale: 0.8; }
      to { opacity: 1; scale: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Payment {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private planService = inject(PlanService);

  planName = signal('Elite');
  planPrice = signal('$49.00');
  isProcessing = signal(false);
  showSuccess = signal(false);

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['plan']) {
        this.planName.set(params['plan']);
        this.planPrice.set(params['price'] || '$0.00');
      }
    });
  }

  processPayment() {
    this.isProcessing.set(true);
    // Simulate API call
    setTimeout(() => {
      this.isProcessing.set(false);
      this.showSuccess.set(true);
      
      // Update the plan globally
      const tier = this.planName().charAt(0).toUpperCase() + this.planName().slice(1).toLowerCase() as UserTier;
      this.planService.upgradeTo(tier);
    }, 2000);
  }

  goBack() {
    this.router.navigate(['/subscription']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
