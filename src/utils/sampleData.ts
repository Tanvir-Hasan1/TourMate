import { Trip, Member, Expense, Category } from '../store/types';

export const getSampleTrip = (): Omit<Trip, 'id' | 'activities'> => {
  const members: Member[] = [
    { id: 'm1', name: 'Tanvir', avatarColor: '#FF6B6B' },
    { id: 'm2', name: 'Arif', avatarColor: '#4ECDC4' },
    { id: 'm3', name: 'Sajib', avatarColor: '#45B7D1' },
    { id: 'm4', name: 'Nabil', avatarColor: '#96CEB4' },
  ];

  const expenses: Expense[] = [
    {
      id: 'e1',
      tripId: 'sample-trip',
      title: 'Lunch at Local Cafe',
      amount: 1200,
      category: 'Food',
      date: new Date().toISOString(),
      paidById: 'm1',
      splitType: 'Equal',
      splits: members.map(m => ({ memberId: m.id, amount: 300 })),
    },
    {
      id: 'e2',
      tripId: 'sample-trip',
      title: 'Bus Tickets to Bandarban',
      amount: 3200,
      category: 'Transport',
      date: new Date().toISOString(),
      paidById: 'm2',
      splitType: 'Equal',
      splits: members.map(m => ({ memberId: m.id, amount: 800 })),
    },
    {
      id: 'e3',
      tripId: 'sample-trip',
      title: 'Resort Booking',
      amount: 8000,
      category: 'Hotel',
      date: new Date().toISOString(),
      paidById: 'm3',
      splitType: 'Equal',
      splits: members.map(m => ({ memberId: m.id, amount: 2000 })),
    },
    {
      id: 'e4',
      tripId: 'sample-trip',
      title: 'Jeep Rental (Chander Gari)',
      amount: 4500,
      category: 'Transport',
      date: new Date().toISOString(),
      paidById: 'm4',
      splitType: 'Equal',
      splits: members.map(m => ({ memberId: m.id, amount: 1125 })),
    },
    {
      id: 'e5',
      tripId: 'sample-trip',
      title: 'Shopping at Hill Market',
      amount: 1500,
      category: 'Shopping',
      date: new Date().toISOString(),
      paidById: 'm1',
      splitType: 'Equal',
      splits: members.map(m => ({ memberId: m.id, amount: 375 })),
    },
  ];

  return {
    name: 'Bandarban Tour',
    destination: 'Bandarban, Bangladesh',
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    members,
    expenses,
  };
};
