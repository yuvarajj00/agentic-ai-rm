import { Injectable, signal } from '@angular/core';
import { DayDetail } from '../models/day-detail.model';

@Injectable({
  providedIn: 'root'
})
export class CurriculumDetailService {
  // In-memory cache of all day details
  private detailsCache: Record<number, DayDetail> | null = null;

  // Active signals
  readonly currentDetail = signal<DayDetail | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly loadError = signal<string | null>(null);

  /**
   * Fetch the static day-details.json if not already in cache
   */
  private async loadDetailsMap(): Promise<Record<number, DayDetail>> {
    if (this.detailsCache) {
      return this.detailsCache;
    }

    const tryUrls = [
      typeof window !== 'undefined' ? '/curriculum/day-details.json' : 'http://localhost:4200/curriculum/day-details.json',
    ];

    let lastError: any = null;
    for (const url of tryUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const rawData = await res.json();
          let normalizedMap: Record<number, DayDetail> = {};

          if (Array.isArray(rawData)) {
            rawData.forEach((item: DayDetail) => {
              if (item && item.day) {
                normalizedMap[item.day] = item;
              }
            });
          } else if (rawData && typeof rawData === 'object') {
            for (const [key, val] of Object.entries(rawData)) {
              const dayNum = Number(key);
              if (!isNaN(dayNum) && val) {
                normalizedMap[dayNum] = val as DayDetail;
              } else if (val && (val as any).day) {
                normalizedMap[(val as any).day] = val as DayDetail;
              }
            }
          }

          this.detailsCache = normalizedMap;
          return normalizedMap;
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(lastError ? lastError.message : 'Failed to load day details catalog.');
  }

  /**
   * Load detailed guide for a specific day number (1-35)
   */
  async loadDayDetail(day: number): Promise<DayDetail | null> {
    this.isLoading.set(true);
    this.loadError.set(null);

    try {
      const map = await this.loadDetailsMap();
      const detail = map[day] || null;
      this.currentDetail.set(detail);
      this.isLoading.set(false);
      return detail;
    } catch (err: any) {
      console.error(`Error loading detail for day ${day}:`, err);
      this.loadError.set(err.message || 'Could not load day details.');
      this.isLoading.set(false);
      return null;
    }
  }

  /**
   * Copy text helper
   */
  async copyCode(code: string): Promise<boolean> {
    try {
      if (navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      return false;
    }
  }
}
