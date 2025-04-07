import { getVendors } from "../data/local-storage-provider";
import { getAccounts } from "../data/local-storage-provider";

export function populateDropdowns() {
    try {
      const vendors = getVendors();
      const accounts = getAccounts();
  
      const vendorSelect = document.getElementById("vendorSelect") as HTMLSelectElement;
      const reportVendorSelect = document.getElementById("reportVendorSelect") as HTMLSelectElement;
      const accountSelect = document.getElementById("accountSelect") as HTMLSelectElement;
      const reportAccountSelect = document.getElementById("reportAccountSelect") as HTMLSelectElement;
  
      vendorSelect.innerHTML = vendors
        .filter(v => v.type === "on-demand")
        .map(v => `<option value="${v.id}">${v.name}</option>`)
        .join('');
      reportVendorSelect.innerHTML = vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
      accountSelect.innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
      reportAccountSelect.innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    } catch (err) {
      console.error("Error in populateDropdowns:", err);
    }
  }