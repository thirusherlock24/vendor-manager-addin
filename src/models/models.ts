export interface Vendor {
  id: string;
  name: string;
  type: "weekly" | "alt-weekly" | "on-demand";
  scheduleAmount?: number;
  scheduleAccountId?: string;
  lastPaidDay?: number | string;
  skip?:number;
}

export interface Transaction {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  type: "weekly" | "alt-weekly" | "on-demand";
  date: string;
  accountId: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  transactions: Transaction[];
}