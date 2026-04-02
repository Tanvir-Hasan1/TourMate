import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './mmkv';
import { Trip, Member, Expense, Activity, Category } from './types';

interface TripState {
  trips: Trip[];
  activeTripId: string | null;
  
  // Actions
  addTrip: (trip: Omit<Trip, 'id' | 'members' | 'expenses' | 'activities'>) => string;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setActiveTrip: (id: string | null) => void;
  
  // Member Actions
  addMember: (tripId: string, name: string, profilePicture?: string) => void;
  updateMember: (tripId: string, memberId: string, name: string, profilePicture?: string) => void;
  removeMember: (tripId: string, memberId: string) => void;
  addDeposit: (tripId: string, memberId: string, amount: number) => void;
  
  // Expense Actions
  addExpense: (tripId: string, expense: Omit<Expense, 'id'>) => void;
  updateExpense: (tripId: string, expenseId: string, expense: Partial<Expense>) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  
  // Activity
  addActivity: (tripId: string, activity: Omit<Activity, 'id' | 'timestamp'>) => void;

  // Selection
  getActiveTrip: () => Trip | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      activeTripId: null,

      addTrip: (tripData) => {
        const id = generateId();
        const newTrip: Trip = {
          ...tripData,
          id,
          members: [],
          deposits: [],
          expenses: [],
          activities: [
            {
              id: generateId(),
              tripId: id,
              timestamp: new Date().toISOString(),
              message: `Trip "${tripData.name}" created`,
              type: 'trip_created',
            },
          ],
        };
        set((state) => ({
          trips: [...state.trips, newTrip],
          activeTripId: state.activeTripId || id,
        }));
        return id;
      },

      updateTrip: (id, tripData) => {
        set((state) => ({
          trips: state.trips.map((t) => (t.id === id ? { ...t, ...tripData } : t)),
        }));
      },

      deleteTrip: (id) => {
        set((state) => ({
          trips: state.trips.filter((t) => t.id !== id),
          activeTripId: state.activeTripId === id ? (state.trips.length > 1 ? state.trips[0].id : null) : state.activeTripId,
        }));
      },

      setActiveTrip: (id) => {
        set({ activeTripId: id });
      },

      addMember: (tripId, name, profilePicture) => {
        const memberId = generateId();
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];
        const avatarColor = colors[Math.floor(Math.random() * colors.length)];
        
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id === tripId) {
              const newMember: Member = { id: memberId, name, avatarColor, profilePicture };
              const newActivity: Activity = {
                id: generateId(),
                tripId,
                timestamp: new Date().toISOString(),
                message: `${name} added to trip`,
                type: 'member_added',
              };
              return {
                ...t,
                members: [...t.members, newMember],
                activities: [newActivity, ...t.activities],
              };
            }
            return t;
          }),
        }));
      },

      removeMember: (tripId, memberId) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id === tripId) {
              const isInvolved = t.expenses.some(e => 
                e.paidById === memberId || e.splits.some(s => s.memberId === memberId)
              );
              if (isInvolved) {
                return t; // Keep unmodified
              }
              return {
                ...t,
                members: t.members.filter((m) => m.id !== memberId),
              };
            }
            return t;
          }),
        }));
      },

      updateMember: (tripId, memberId, name, profilePicture) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id === tripId) {
              return {
                ...t,
                members: t.members.map((m) => m.id === memberId ? { ...m, name, profilePicture: profilePicture !== undefined ? profilePicture : m.profilePicture } : m),
              };
            }
            return t;
          }),
        }));
      },

      addDeposit: (tripId, memberId, amount) => {
        const id = generateId();
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id === tripId) {
              const deps = t.deposits || [];
              const memberName = t.members.find(m => m.id === memberId)?.name || 'Someone';
              const newActivity: Activity = {
                id: generateId(),
                tripId,
                timestamp: new Date().toISOString(),
                message: `${memberName} deposited ৳${amount} to Group Fund`,
                type: 'expense_added', // Reusing this icon type internally
              };
              return {
                ...t,
                deposits: [...deps, { id, tripId, memberId, amount, date: new Date().toISOString() }],
                activities: [newActivity, ...t.activities],
              };
            }
            return t;
          }),
        }));
      },

      addExpense: (tripId, expenseData) => {
        const id = generateId();
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id === tripId) {
              const newExpense: Expense = { ...expenseData, id };
              const payerName = t.members.find(m => m.id === expenseData.paidById)?.name || 'Someone';
              const newActivity: Activity = {
                id: generateId(),
                tripId,
                timestamp: new Date().toISOString(),
                message: `${payerName} added ${expenseData.title} - ${expenseData.amount}`,
                type: 'expense_added',
              };
              return {
                ...t,
                expenses: [newExpense, ...t.expenses],
                activities: [newActivity, ...t.activities],
              };
            }
            return t;
          }),
        }));
      },

      updateExpense: (tripId, expenseId, expenseData) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id === tripId) {
              return {
                ...t,
                expenses: t.expenses.map((e) => (e.id === expenseId ? { ...e, ...expenseData } : e)),
              };
            }
            return t;
          }),
        }));
      },

      deleteExpense: (tripId, expenseId) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id === tripId) {
              const expenseTitle = t.expenses.find(e => e.id === expenseId)?.title || 'Expense';
              const newActivity: Activity = {
                id: generateId(),
                tripId,
                timestamp: new Date().toISOString(),
                message: `Deleted ${expenseTitle}`,
                type: 'expense_deleted',
              };
              return {
                ...t,
                expenses: t.expenses.filter((e) => e.id !== expenseId),
                activities: [newActivity, ...t.activities],
              };
            }
            return t;
          }),
        }));
      },

      addActivity: (tripId, activityData) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id === tripId) {
              const newActivity: Activity = {
                ...activityData,
                id: generateId(),
                timestamp: new Date().toISOString(),
              };
              return {
                ...t,
                activities: [newActivity, ...t.activities],
              };
            }
            return t;
          }),
        }));
      },

      getActiveTrip: () => {
        const state = get();
        const trip = state.trips.find((t) => t.id === state.activeTripId);
        if (trip && !trip.deposits) {
          trip.deposits = [];
        }
        return trip;
      },
    }),
    {
      name: 'tourmate-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
