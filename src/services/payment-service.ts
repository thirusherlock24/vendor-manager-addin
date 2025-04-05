import { Transaction } from "../models/models";
import { getAccounts, getVendors, saveAccounts } from "../data/local-storage-provider";

export function performPayment(vendorId: string, amount: number, accountId: string): boolean {
  const accounts = getAccounts();
  const account = accounts.find(a => a.id === accountId);
  if (!account || account.balance < amount) return false;
  const vendor = getVendors().find(v => v.id === vendorId);
  const vendorName = vendor.name? vendor.name : "Unknown Vendor";
  const vendorType = getVendors().find(v => v.id === vendorId)?.type;
  const txn: Transaction = {
    id: `txn-${Date.now()}`,
    vendorId,
    amount,
    vendorName,
    type: vendorType || "on-demand",
    date: new Date().toISOString(),
    accountId,
  };

  account.balance -= amount;
  account.transactions.push(txn);
  saveAccounts(accounts);
  return true;
}

