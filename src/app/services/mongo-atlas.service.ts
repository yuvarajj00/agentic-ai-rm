import { Injectable, signal } from '@angular/core';
import { DailyTask, WeeklyMilestone, TechSkill } from '../models/curriculum.model';

export interface RoadmapStatePayload {
  dailyTasks: DailyTask[];
  milestones: WeeklyMilestone[];
  techStack: TechSkill[];
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MongoAtlasService {
  // Sync status signals
  readonly syncStatus = signal<'connected' | 'syncing' | 'saving' | 'error'>('syncing');
  readonly lastSyncedAt = signal<string>('Connecting to MongoDB Atlas...');
  readonly syncError = signal<string | null>(null);

  private getPrimaryApiUrl(): string {
    return '/api/progress';
  }

  private getFallbackApiUrl(): string {
    return 'http://localhost:3000/api/progress';
  }

  private async fetchWithFallback(url: string, options?: RequestInit): Promise<Response> {
    try {
      let targetUrl = url;
      const isBrowser = typeof window !== 'undefined' &&
                        window.location &&
                        window.location.origin &&
                        window.location.origin !== 'null' &&
                        !window.location.origin.startsWith('about:');

      if (isBrowser) {
        if (window.location.port === '4200' && !url.startsWith('http://localhost:3000')) {
          targetUrl = url.replace('/api/', 'http://localhost:3000/api/');
        }
      } else {
        if (url.startsWith('/')) {
          targetUrl = `http://localhost:3000${url}`;
        }
      }

      const res = await fetch(targetUrl, options);
      if (res.ok) {
        return res;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      // If client runs on port 4200 (ng serve) without proxy, fallback directly to express port 3000
      if (
        typeof window !== 'undefined' &&
        window.location &&
        window.location.port === '4200' &&
        !url.startsWith('http://localhost:3000')
      ) {
        const fallback = url.startsWith('/') ? `http://localhost:3000${url}` : url;
        return await fetch(fallback, options);
      }
      throw err;
    }
  }

  async fetchProgress(): Promise<RoadmapStatePayload | null> {
    this.syncStatus.set('syncing');
    try {
      const res = await this.fetchWithFallback(this.getPrimaryApiUrl());
      if (!res.ok) throw new Error(`Atlas server error: HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.exists && json.data) {
        this.syncStatus.set('connected');
        this.syncError.set(null);
        this.lastSyncedAt.set(new Date().toLocaleTimeString());
        return json.data as RoadmapStatePayload;
      }
      this.syncStatus.set('connected');
      this.lastSyncedAt.set('Initialized default state');
      return null;
    } catch (err: any) {
      this.syncStatus.set('error');
      this.syncError.set(err?.message || 'Failed connecting to Atlas');
      return null;
    }
  }

  async saveProgress(state: RoadmapStatePayload): Promise<boolean> {
    this.syncStatus.set('saving');
    try {
      const res = await this.fetchWithFallback(this.getPrimaryApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state)
      });
      if (!res.ok) throw new Error(`Atlas server error: HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        this.syncStatus.set('connected');
        this.syncError.set(null);
        this.lastSyncedAt.set(new Date().toLocaleTimeString());
        return true;
      }
      throw new Error(json.error || 'Failed saving to MongoDB Atlas');
    } catch (err: any) {
      this.syncStatus.set('error');
      this.syncError.set(err?.message || 'Atlas save failed');
      return false;
    }
  }

  async resetAtlas(): Promise<boolean> {
    try {
      await this.fetchWithFallback('/api/progress/reset', { method: 'POST' });
      return true;
    } catch {
      return false;
    }
  }
}
