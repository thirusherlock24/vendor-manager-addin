import { getAccounts } from "../data/local-storage-provider";
import { Transaction ,Account} from "../models/models";

export function getAllTransactions(): Transaction[] {
  return getAccounts().flatMap(a => a.transactions);
}

export function getVendorTransactions(vendorId: string): Transaction[] {
  return getAllTransactions().filter(t => t.vendorId === vendorId);
}

export function getOnDemandTransactions(): Transaction[] {
  return getAllTransactions().filter(t => t.type === "on-demand");
}
export function getScheduledTransactions(): Transaction[] {
  return getAllTransactions().filter(t => t.type === "weekly" || t.type === "alt-weekly");
}

export function getAccountTransactions(accountId: string): Transaction[] {
  const acc = getAccounts().find(a => a.id === accountId);
  return acc ? acc.transactions : [];
}

export function getAccountDetails(): Omit<Account, "transactions">[] {
  const accounts = getAccounts(); 
  return accounts.map(({ id, name, balance }) => ({
    id,
    name,
    balance
  }));
}