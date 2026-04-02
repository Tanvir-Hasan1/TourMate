export type Category = 'Food' | 'Transport' | 'Hotel' | 'Tickets' | 'Shopping' | 'Other';

export interface Member {
  id: string;
  name: string;
  avatarColor: string;
  profilePicture?: string;
}

export interface Split {
  memberId: string;
  amount: number;
}

export interface Deposit {
  id: string;
  tripId: string;
  memberId: string;
  amount: number;
  date: string;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: Category;
  date: string; // ISO string
  paidById: string;
  splitType: 'Equal' | 'Custom' | 'Percentage';
  splits: Split[];
  receiptUri?: string;
  receiptUris?: string[];
}

export interface Activity {
  id: string;
  tripId: string;
  timestamp: string;
  message: string;
  type: 'expense_added' | 'expense_deleted' | 'member_added' | 'trip_created';
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: Member[];
  deposits: Deposit[];
  expenses: Expense[];
  activities: Activity[];
}
