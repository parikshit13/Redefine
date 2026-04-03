import { pgTable, uuid, text, boolean, timestamp, integer, date } from 'drizzle-orm/pg-core';

// Users table — synced with Clerk user IDs
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Habits table
export const habits = pgTable('habits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('clock'),
  color: text('color').notNull().default('sage'),
  timeLabel: text('time_label').default(''),
  frequency: text('frequency').notNull().default('daily'),
  days: text('days').notNull().default('0,1,2,3,4,5,6'),
  reminderTime: text('reminder_time'),
  reminderEnabled: boolean('reminder_enabled').default(false),
  goalCount: integer('goal_count').default(1),
  goalDuration: integer('goal_duration').default(0),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Completions table — one row per habit per day
export const completions = pgTable('completions', {
  id: uuid('id').defaultRandom().primaryKey(),
  habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  completed: boolean('completed').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types inferred from schema
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;
export type Completion = typeof completions.$inferSelect;
export type InsertCompletion = typeof completions.$inferInsert;
