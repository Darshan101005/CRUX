import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import {PlanService} from './plan.service';
import {LocationService, PricingInfo} from './location.service';

@Component({
  standalone: true,
  selector: 'app-subscription',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-12 animate-in fade-in duration-700 pb-20">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-display">Subscription & Billing</h2>
        <div class="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60">
          <mat-icon class="text-sm">location_on</mat-icon>
          <span>Region: <b>{{locationService.currentInfo().country}}</b></span>
        </div>
      </div>

      <section class="space-y-6">
        <div class="glass-panel p-10 bg-gradient-to-br from-arctic-light/10 to-arctic-dark/10 relative overflow-hidden border-wave-start/10">
          <div class="neon-glow w-64 h-64 bg-wave-start/10 -top-32 -right-32 animate-pulse"></div>

          <h3 class="text-2xl mb-8 flex items-center gap-3 font-display">
            <mat-icon class="text-wave-start">workspace_premium</mat-icon>
            Membership Plans
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            @for (plan of reactivePlans(); track plan.name) {
              <div 
                class="glass-card p-8 flex flex-col h-full relative group transition-all duration-500"
                [class.border-wave-start]="plan.current"
                [class.bg-wave-start/5]="plan.current"
              >
                @if (plan.current) {
                  <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-wave-start text-arctic-dark text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(67,233,123,0.4)]">
                    Current Protocol
                  </div>
                }

                <div class="mb-8">
                  <h4 class="text-xl font-display mb-1">{{plan.name}}</h4>
                  <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold">{{locationService.currentInfo().symbol}}{{plan.price}}</span>
                    <span class="text-xs text-white/40">/month</span>
                  </div>
                </div>

                <ul class="space-y-4 mb-10 flex-1">
                  @for (feature of plan.features; track feature) {
                    <li class="flex items-start gap-2 text-sm text-white/60">
                      <mat-icon class="text-wave-start text-[18px] shrink-0">check_circle</mat-icon>
                      <span>{{feature}}</span>
                    </li>
                  }
                </ul>

                <button 
                  (click)="upgrade(plan)"
                  [disabled]="plan.isDisabled"
                  [class]="plan.isDisabled ? 'btn-secondary w-full justify-center opacity-40 cursor-default font-bold' : 'btn-primary w-full justify-center font-bold'"
                >
                  {{plan.buttonText}}
                </button>
              </div>
            }
          </div>

          <div class="mt-12 text-center flex flex-col items-center gap-4">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
               <mat-icon class="text-sm">verified_user</mat-icon>
               Security Check Passed: Your billing info is encrypted
            </div>
            <p class="text-xs text-white/30 italic">Pricing automatically localized based on your region ({{locationService.currentInfo().currency}}). Plans billed monthly.</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Subscription {
  private router = inject(Router);
  private planService = inject(PlanService);
  locationService = inject(LocationService);
  
  private plans: readonly (
    | { readonly name: 'Free'; readonly price: string; readonly features: readonly string[] }
    | { readonly name: 'Premium'; readonly getPrice: (info: { premiumPrice: string }) => string; readonly features: readonly string[] }
    | { readonly name: 'Elite'; readonly getPrice: (info: { elitePrice: string }) => string; readonly features: readonly string[] }
  )[] = [
    {
      name: 'Free',
      price: '0.00',
      features: ['1 Platform connection', 'Basic AI summarization', 'Standard latency', 'Email support']
    },
    {
      name: 'Premium',
      getPrice: (info) => info.premiumPrice,
      features: ['3 Platform connections', 'Advanced AI insights', 'Priority processing', '24/7 Priority support', 'Custom update frequency']
    },
    {
      name: 'Elite',
      getPrice: (info) => info.elitePrice,
      features: ['Unlimited connections', 'Real-time neural analysis', 'Zero latency summaries', 'Dedicated account manager', 'API access']
    }
  ] as const;

  constructor() {
    this.locationService.requestPermissionAndDetect();
  }

  reactivePlans = computed(() => {
    const currentTier = this.planService.currentTier();
    const info = this.locationService.currentInfo();
    
    const tierOrder: Record<string, number> = { 'Free': 0, 'Premium': 1, 'Elite': 2 };

    return this.plans.map(p => {
      let price = '0.00';
      if ('getPrice' in p) {
        price = p.getPrice(info as PricingInfo);
      } else {
        price = p.price;
      }

      const isCurrent = p.name === currentTier;
      const pOrder = tierOrder[p.name];
      const currentOrder = tierOrder[currentTier];
      
      let buttonText = 'Upgrade to ' + p.name;
      let isDisabled = false;

      if (isCurrent) {
        buttonText = 'Already Active';
        isDisabled = true;
      } else if (pOrder < currentOrder) {
        // If it's a lower tier, indicate it's already part of the current higher package
        buttonText = p.name === 'Free' ? 'Free (Included)' : 'Already Used';
        isDisabled = true;
      }

      return {
        ...p,
        price,
        current: isCurrent,
        buttonText,
        isDisabled
      };
    });
  });

  upgrade(plan: { name: string, price: string }) {
    this.router.navigate(['/payment'], { 
      queryParams: { 
        plan: plan.name.toLowerCase(),
        price: `${this.locationService.currentInfo().symbol}${plan.price}`
      }
    });
  }
}
