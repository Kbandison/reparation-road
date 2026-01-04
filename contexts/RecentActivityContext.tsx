"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ActivityItem {
  id: string;
  type: 'record' | 'collection' | 'search';
  title: string;
  subtitle?: string;
  url: string;
  collectionName?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface RecentActivityContextType {
  activities: ActivityItem[];
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  clearActivity: () => void;
  getRecentActivities: (limit?: number) => ActivityItem[];
}

const RecentActivityContext = createContext<RecentActivityContextType | undefined>(undefined);

const STORAGE_KEY = 'reparation_road_recent_activity';
const MAX_ACTIVITIES = 50;

export const RecentActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load activities from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setActivities(parsed);
      }
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
      } catch (error) {
        console.error('Error saving recent activity:', error);
      }
    }
  }, [activities, isInitialized]);

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: `${activity.type}-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    setActivities((prev) => {
      // Remove duplicate if same URL exists
      const filtered = prev.filter(a => a.url !== newActivity.url);

      // Add new activity to the beginning
      const updated = [newActivity, ...filtered];

      // Keep only the most recent MAX_ACTIVITIES items
      return updated.slice(0, MAX_ACTIVITIES);
    });
  }, []);

  const clearActivity = useCallback(() => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getRecentActivities = useCallback((limit: number = 10) => {
    return activities.slice(0, limit);
  }, [activities]);

  return (
    <RecentActivityContext.Provider
      value={{
        activities,
        addActivity,
        clearActivity,
        getRecentActivities,
      }}
    >
      {children}
    </RecentActivityContext.Provider>
  );
};

export const useRecentActivity = () => {
  const context = useContext(RecentActivityContext);
  if (context === undefined) {
    throw new Error('useRecentActivity must be used within a RecentActivityProvider');
  }
  return context;
};
