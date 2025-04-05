export interface Vendor {
  id: string;
  name: string;
  type: 'weekly' | 'alt-weekly' | 'on-demand';
}

export interface Transaction {
  id: string;
  vendorId: string;
  amount: number;
  type: 'on-demand' | 'scheduled';
  date: string;
  accountId: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  transactions: Transaction[];
}