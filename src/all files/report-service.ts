import { getAccounts } from "../data/local-storage-provider";
import { Transaction } from "../models/models";

export function getAllTransactions(): Transaction[] {
  return getAccounts().flatMap(a => a.transactions);
}

export function getVendorTransactions(vendorId: string): Transaction[] {
  return getAllTransactions().filter(t => t.vendorId === vendorId);
}

export function getAccountTransactions(accountId: string): Transaction[] {
  const acc = getAccounts().find(a => a.id === accountId);
  return acc ? acc.transactions : [];
}