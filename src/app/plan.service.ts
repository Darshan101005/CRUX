import {Injectable, signal} from '@angular/core';

export type UserTier = 'Free' | 'Premium' | 'Elite';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  currentTier = signal<UserTier>('Free');

  upgradeTo(tier: UserTier) {
    this.currentTier.set(tier);
  }
}
