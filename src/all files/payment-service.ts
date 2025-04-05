import { Transaction } from "../models/models";
import { getAccounts, saveAccounts, getVendors } from "../data/local-storage-provider";

export function performPayment(vendorId: string, amount: number, accountId: string): boolean {
  const accounts = getAccounts();
  const account = accounts.find(a => a.id === accountId);
  if (!account || account.balance < amount) return false;
  const vendors = getVendors();
  const vendor = vendors.find(v => v.id === vendorId);
const vendorName = vendor ? vendor.name : "Unknown Vendor";
  const txn: Transaction = {
    id: `txn-${Date.now()}`,
    vendorId,
    amount,
    vendorName,
    type: "on-demand",
    date: new Date().toISOString(),
    accountId,
  };

  account.balance -= amount;
  account.transactions.push(txn);
  saveAccounts(accounts);
  return true;
}