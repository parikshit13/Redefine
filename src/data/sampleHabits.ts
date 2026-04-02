// src/data/sampleHabits.ts
// Pre-populate the app with these exact habits for the demo

export type Habit = {
  id: string;
  name: string;
  icon: string;         // icon key matching the SVG component
  color: 'sage' | 'lavender' | 'peach' | 'sky' | 'rose';
  timeLabel: string;    // display label like "6:30 AM" or "Evening"
  frequency: 'daily' | 'weekdays' | 'custom';
  days: number[];       // 0=Mon, 1=Tue, ... 6=Sun
  reminderTime?: string;
  reminderEnabled: boolean;
  goalCount: number;    // times per day
  goalDuration: number; // minutes
  streak: number;       // current streak in days
  bestStreak: number;
  completedToday: boolean;
  completionHistory: Record<string, boolean>; // ISO date string -> completed
};

export const sampleHabits: Habit[] = [
  {
    id: '1',
    name: 'Morning workout',
    icon: 'dumbbell',
    color: 'sage',
    timeLabel: '6:30 AM',
    frequency: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '06:30',
    reminderEnabled: true,
    goalCount: 1,
    goalDuration: 45,
    streak: 14,
    bestStreak: 21,
    completedToday: true,
    completionHistory: {},
  },
  {
    id: '2',
    name: 'Read 30 minutes',
    icon: 'book',
    color: 'lavender',
    timeLabel: 'Evening',
    frequency: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '21:00',
    reminderEnabled: true,
    goalCount: 1,
    goalDuration: 30,
    streak: 9,
    bestStreak: 15,
    completedToday: true,
    completionHistory: {},
  },
  {
    id: '3',
    name: 'Meditate',
    icon: 'leaf',
    color: 'peach',
    timeLabel: '10 min',
    frequency: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '07:30',
    reminderEnabled: true,
    goalCount: 1,
    goalDuration: 10,
    streak: 6,
    bestStreak: 12,
    completedToday: false,
    completionHistory: {},
  },
  {
    id: '4',
    name: 'Drink 2L water',
    icon: 'waterdrop',
    color: 'sky',
    timeLabel: 'All day',
    frequency: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: false,
    goalCount: 8,
    goalDuration: 0,
    streak: 22,
    bestStreak: 22,
    completedToday: true,
    completionHistory: {},
  },
  {
    id: '5',
    name: 'Journal before bed',
    icon: 'calendar',
    color: 'rose',
    timeLabel: '10 PM',
    frequency: 'daily',
    days: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: '22:00',
    reminderEnabled: true,
    goalCount: 1,
    goalDuration: 15,
    streak: 3,
    bestStreak: 8,
    completedToday: false,
    completionHistory: {},
  },
];