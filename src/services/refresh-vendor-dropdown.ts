import { getVendors } from "../data/local-storage-provider";

export function refreshVendorDropdown() {
    const vendors = getVendors();
    const list = document.getElementById("vendorList") as HTMLSelectElement;
    list.innerHTML = vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
  }