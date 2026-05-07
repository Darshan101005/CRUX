import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface PricingInfo {
  country: string;
  currency: string;
  symbol: string;
  premiumPrice: string;
  elitePrice: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private pricingData: Record<string, PricingInfo> = {
    'IN': { country: 'India', currency: 'INR', symbol: '₹', premiumPrice: '199', elitePrice: '499' },
    'EU': { country: 'Europe', currency: 'EUR', symbol: '€', premiumPrice: '4.99', elitePrice: '9.99' },
    'US': { country: 'USA', currency: 'USD', symbol: '$', premiumPrice: '4.99', elitePrice: '9.99' },
    'GB': { country: 'UK', currency: 'GBP', symbol: '£', premiumPrice: '3.99', elitePrice: '7.99' },
    'CA': { country: 'Canada', currency: 'CAD', symbol: 'C$', premiumPrice: '6.99', elitePrice: '12.99' },
    'AU': { country: 'Australia', currency: 'AUD', symbol: 'A$', premiumPrice: '7.99', elitePrice: '14.99' },
    'JP': { country: 'Japan', currency: 'JPY', symbol: '¥', premiumPrice: '700', elitePrice: '1400' },
    'DEFAULT': { country: 'Global', currency: 'USD', symbol: '$', premiumPrice: '4.99', elitePrice: '9.99' }
  };

  currentInfo = signal<PricingInfo>(this.pricingData['DEFAULT']);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    // Constructor handles DI initialization
  }

  async requestPermissionAndDetect() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      // Step 1: Try Browser Geolocation (Triggers Permission Prompt)
      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            timeout: 8000,
            enableHighAccuracy: false
          });
        });

        const { latitude, longitude } = position.coords;
        // Step 2: Reverse Geocode (Coordinates to Country)
        const geocodeResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const geocodeData = await geocodeResponse.json();
        const countryCode = geocodeData.countryCode;

        if (countryCode && this.pricingData[countryCode]) {
          this.currentInfo.set(this.pricingData[countryCode]);
          return;
        }
      }
    } catch (error) {
      console.warn('Geolocation failed or denied, using IP fallback.', error);
    } finally {
      // Always try IP fallback if geolocation didn't set currentInfo yet or failed
      if (this.currentInfo().country === 'Global') {
        await this.detectViaIp();
      }
    }
  }

  private async detectViaIp() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const countryCode = data.country_code;
      
      if (this.pricingData[countryCode]) {
        this.currentInfo.set(this.pricingData[countryCode]);
      } else if (data.in_eu) {
        this.currentInfo.set(this.pricingData['EU']);
      }
    } catch (err) {
      console.error('IP detection failed.', err);
    }
  }

  getPricing(plan: 'Free' | 'Premium' | 'Elite'): string {
    const info = this.currentInfo();
    if (plan === 'Free') return `${info.symbol}0`;
    if (plan === 'Premium') return `${info.symbol}${info.premiumPrice}`;
    return `${info.symbol}${info.elitePrice}`;
  }
}
