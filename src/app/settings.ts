import {ChangeDetectionStrategy, Component, inject, computed, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors} from '@angular/forms';
import {PlanService} from './plan.service';
import {LocationService} from './location.service';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="space-y-12 animate-in fade-in duration-700 pb-20">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-display">Account Settings</h2>
      </div>

      <!-- Profile & Security Section -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Profile Information -->
        <div class="glass-panel p-8 space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 rounded-full bg-wave-start/20 flex items-center justify-center border border-wave-start/30">
                <mat-icon class="text-wave-start">person</mat-icon>
              </div>
              <h3 class="text-xl">Profile Information</h3>
              <div class="ml-auto px-3 py-1 rounded-full bg-wave-start/10 border border-wave-start/20 text-wave-start text-[10px] font-bold uppercase tracking-widest">
                {{planService.currentTier()}}
              </div>
            </div>
          
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-4">
            <div class="space-y-2">
              <label for="displayName" class="block text-xs font-bold uppercase tracking-widest text-white/40">Display Name</label>
              <input id="displayName" type="text" formControlName="displayName" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-wave-start transition-all">
            </div>
            <div class="space-y-2">
              <label for="email" class="block text-xs font-bold uppercase tracking-widest text-white/40">Email Address</label>
              <input id="email" type="email" formControlName="email" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-wave-start transition-all">
            </div>
            <div class="pt-2">
              <button type="submit" [disabled]="profileForm.invalid" class="btn-secondary w-full justify-center">
                @if (profileUpdating()) {
                  <mat-icon class="animate-spin">sync</mat-icon>
                  Updating...
                } @else {
                  Update Profile
                }
              </button>
            </div>
          </form>
        </div>

        <!-- Change Password -->
        <div class="glass-panel p-8 space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-ice-blue/20 flex items-center justify-center border border-ice-blue/30">
              <mat-icon class="text-ice-blue">lock</mat-icon>
            </div>
            <h3 class="text-xl">Change Password</h3>
          </div>

          <form [formGroup]="passwordForm" (ngSubmit)="updatePassword()" class="space-y-4">
            <div class="space-y-2">
              <label for="newPassword" class="block text-xs font-bold uppercase tracking-widest text-white/40">New Password</label>
              <input id="newPassword" type="password" formControlName="newPassword" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-wave-start transition-all">
              
              <!-- Password Rules Checklist -->
              <div class="grid grid-cols-2 gap-2 mt-4 p-4 bg-black/20 rounded-xl border border-white/5">
                @for (rule of passwordRules(); track rule.label) {
                  <div class="flex items-center gap-2">
                    <mat-icon [class]="rule.valid ? 'text-emerald-400' : 'text-white/20'" class="text-xs scale-75">
                      {{ rule.valid ? 'check_circle' : 'circle' }}
                    </mat-icon>
                    <span class="text-[10px]" [class.text-white/40]="!rule.valid" [class.text-emerald-400/80]="rule.valid">
                      {{ rule.label }}
                    </span>
                  </div>
                }
              </div>
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="block text-xs font-bold uppercase tracking-widest text-white/40">Confirm New Password</label>
              <input id="confirmPassword" type="password" formControlName="confirmPassword" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-wave-start transition-all">
              @if (passwordForm.errors?.['mismatch'] && passwordForm.get('confirmPassword')?.touched) {
                <p class="text-[10px] text-red-400 mt-1">Passwords do not match</p>
              }
            </div>

            <div class="pt-2">
              <button type="submit" [disabled]="passwordForm.invalid" class="btn-secondary w-full justify-center">
                @if (passwordUpdating()) {
                  <mat-icon class="animate-spin">sync</mat-icon>
                }
                Update Password
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Advanced Security Settings -->
      <section class="glass-panel p-8 space-y-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-neon-violet/20 flex items-center justify-center border border-neon-violet/30">
            <mat-icon class="text-neon-violet">security</mat-icon>
          </div>
          <h3 class="text-xl font-display">Account Security</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- 2FA -->
          <div class="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Recommended</span>
                <div class="flex items-center gap-2">
                   <div [class]="twoFactorEnabled() ? 'bg-emerald-500' : 'bg-white/20'" class="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                   <span class="text-[10px] uppercase font-bold text-white/40">{{ twoFactorEnabled() ? 'Enabled' : 'Disabled' }}</span>
                </div>
              </div>
              <h4 class="text-lg">Two-Factor Authentication</h4>
              <p class="text-sm text-white/40 leading-relaxed">Protect your account with an additional verification step. Required for Elite access in sensitive regions.</p>
            </div>
            <button (click)="toggle2FA()" class="mt-6 btn-secondary text-xs uppercase tracking-[0.2em] w-full justify-center">
              {{ twoFactorEnabled() ? 'Configure 2FA' : 'Enable Setup' }}
            </button>
          </div>

          <!-- Login History -->
          <div class="p-6 bg-white/5 rounded-2xl border border-white/5">
            <h4 class="text-lg mb-6 flex items-center gap-2">
              <mat-icon class="text-ice-blue">history</mat-icon>
              Recent Activity
            </h4>
            <div class="space-y-4">
              @for (session of loginHistory; track session.id) {
                <div class="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                  <div class="flex items-center gap-3">
                    <mat-icon class="text-white/20">{{ session.device === 'Mobile' ? 'smartphone' : 'desktop_windows' }}</mat-icon>
                    <div>
                      <p class="text-[10px] font-bold text-white/80">{{ session.location }}</p>
                      <p class="text-[10px] text-white/40">{{ session.browser }} • {{ session.date }}</p>
                    </div>
                  </div>
                  <span class="text-[10px] font-mono text-ice-blue/60">{{ session.ip }}</span>
                </div>
              }
            </div>
            <button class="w-full mt-6 text-[10px] uppercase font-bold text-ice-blue text-center tracking-widest hover:text-white transition-colors">
              Refresh Session List
            </button>
          </div>
        </div>
      </section>
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
export class Settings {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public planService = inject(PlanService);
  public locationService = inject(LocationService);

  profileUpdating = signal(false);
  passwordUpdating = signal(false);
  twoFactorEnabled = signal(false);

  profileForm = this.fb.group({
    displayName: ['Arctic Explorer', [Validators.required, Validators.minLength(3)]],
    email: ['explorer@explorer.ai', [Validators.required, Validators.email]]
  });

  passwordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(5), this.passwordValidator()]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.matchValidator });

  passwordRules = computed(() => {
    const pwd = this.passwordForm.get('newPassword')?.value || '';
    return [
      { label: 'Min 5 characters', valid: pwd.length >= 5 },
      { label: 'One UPPERCASE', valid: /[A-Z]/.test(pwd) },
      { label: 'One lowercase', valid: /[a-z]/.test(pwd) },
      { label: 'One number', valid: /[0-9]/.test(pwd) },
      { label: 'Special character', valid: /[^A-Za-z0-9]/.test(pwd) }
    ];
  });

  loginHistory = [
    { id: 1, location: 'San Francisco, US', browser: 'Chrome Desktop', date: '2 mins ago', ip: '192.168.1.1', device: 'Desktop' },
    { id: 2, location: 'New York, US', browser: 'Safari Mobile', date: '4 hours ago', ip: '172.16.0.42', device: 'Mobile' },
    { id: 3, location: 'Unknown', browser: 'Brave Desktop', date: 'May 12, 2024', ip: '45.16.2.19', device: 'Desktop' }
  ];

  constructor() {
    // Initial data loading processed via signals
  }

  updateProfile() {
    this.profileUpdating.set(true);
    setTimeout(() => {
      this.profileUpdating.set(false);
      alert('Profile updated successfully!');
    }, 1500);
  }

  updatePassword() {
    this.passwordUpdating.set(true);
    setTimeout(() => {
      this.passwordUpdating.set(false);
      this.passwordForm.reset();
      alert('Password changed successfully!');
    }, 1500);
  }

  toggle2FA() {
    const state = this.twoFactorEnabled();
    if (!state) {
      if (confirm('Enable Two-Factor Authentication via Authenticator App?')) {
        this.twoFactorEnabled.set(true);
      }
    } else {
      if (confirm('Disable Two-Factor Authentication? This will decrease your account security.')) {
        this.twoFactorEnabled.set(false);
      }
    }
  }

  private passwordValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value || '';
      const hasUpper = /[A-Z]/.test(val);
      const hasLower = /[a-z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasSpecial = /[^A-Za-z0-9]/.test(val);
      
      const valid = val.length >= 5 && hasUpper && hasLower && hasNumber && hasSpecial;
      return valid ? null : { strength: true };
    };
  }

  private matchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }
}
