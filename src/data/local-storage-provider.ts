import { Vendor, Account } from "../models/models";

export function getVendors(): Vendor[] {
  return JSON.parse(localStorage.getItem("vendors") || "[]");
}

export function saveVendors(vendors: Vendor[]) {
  localStorage.setItem("vendors", JSON.stringify(vendors));
}


export function removeVendor(id: string) {
  const vendors = getVendors();
  const index = vendors.findIndex(v => v.id === id);
  if (index !== -1) {
    vendors.splice(index, 1);
    saveVendors(vendors);
  }
}
export function getAccounts(): Account[] {
  return JSON.parse(localStorage.getItem("accounts") || "[]");
}

export function saveAccounts(accounts: Account[]) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

export function initializeAccounts() {
  if (!localStorage.getItem("accounts")) {
    const accounts: Account[] = [
      { id: "acc1", name: "Account 1", balance: 200000, transactions: [] },
      { id: "acc2", name: "Account 2", balance: 200000, transactions: [] },
    ];
    saveAccounts(accounts);
  }
}