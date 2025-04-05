import { getVendors, getAccounts, initializeAccounts, removeVendor, editVendor } from "../data/local-storage-provider";
import { addVendor, exportVendorsToExcel } from "../services/vendor-service";
import { performPayment } from "../services/payment-service";
import { getAllTransactions, getVendorTransactions, getAccountTransactions } from "../ui/report-service";
import { Transaction } from "../models/models";

window.onload = () => {
  Office.onReady(() => {
    initializeAccounts();
    populateDropdowns();
    setupEventHandlers();
    showSection("homePage");
  });
};

function refreshVendorDropdown() {
  const vendors = getVendors();
  const list = document.getElementById("vendorList") as HTMLSelectElement;
  list.innerHTML = vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
}

function setupEditDeleteHandlers() {
  const editBtn = document.getElementById("editVendorBtn") as HTMLButtonElement;
  const deleteBtn = document.getElementById("deleteVendorBtn") as HTMLButtonElement;
  const saveBtn = document.getElementById("saveEditedVendorBtn") as HTMLButtonElement;
  const cancelBtn = document.getElementById("cancelEditVendorBtn") as HTMLButtonElement;

  editBtn.addEventListener("click", () => {
    const vendorId = (document.getElementById("vendorList") as HTMLSelectElement).value;
    const vendor = getVendors().find(v => v.id === vendorId);
    if (!vendor) return console.log("Please select a vendor.");

    const nameInput = document.getElementById("editVendorName") as HTMLInputElement;
    const typeSelect = document.getElementById("editVendorType") as HTMLSelectElement;

    nameInput.value = vendor.name;
    typeSelect.value = vendor.type;
    nameInput.dataset.editingId = vendor.id;

    document.getElementById("editVendorForm")!.style.display = "block";
  });

  deleteBtn.addEventListener("click", () => {
    const vendorId = (document.getElementById("vendorList") as HTMLSelectElement).value;
    if (!vendorId) return console.log("Select a vendor first.");
      removeVendor(vendorId);
      showNotification("editVendorNotification","Removed Vendor successfully!");

      refreshVendorDropdown();
      populateDropdowns();
      document.getElementById("editVendorForm")!.style.display = "none";
    
  });

  saveBtn.addEventListener("click", () => {
    const nameInput = document.getElementById("editVendorName") as HTMLInputElement;
    const typeSelect = document.getElementById("editVendorType") as HTMLSelectElement;
    const id = nameInput.dataset.editingId;

    if (!id || !nameInput.value.trim()) return console.log("Vendor name is required.");

    editVendor(id, nameInput.value.trim(), typeSelect.value as any);
    showNotification("editVendorNotification","Edited Vendor successfully!");

    refreshVendorDropdown();
    populateDropdowns();
    nameInput.value = "";
    delete nameInput.dataset.editingId;
    document.getElementById("editVendorForm")!.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
    document.getElementById("editVendorForm")!.style.display = "none";
  });
}

function showSection(sectionId: string) {
  const sections = ["homePage", "vendorSection", "paymentSection", "reportSection", "viewSection"];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === sectionId ? "block" : "none";
  });
if (sectionId === "viewSection") refreshVendorDropdown();


}
(window as any).showSection = showSection;

function populateDropdowns() {
  try {
    const vendors = getVendors();
    const accounts = getAccounts();

    const vendorSelect = document.getElementById("vendorSelect") as HTMLSelectElement;
    const reportVendorSelect = document.getElementById("reportVendorSelect") as HTMLSelectElement;
    const accountSelect = document.getElementById("accountSelect") as HTMLSelectElement;
    const reportAccountSelect = document.getElementById("reportAccountSelect") as HTMLSelectElement;

    vendorSelect.innerHTML = vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    reportVendorSelect.innerHTML = vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    accountSelect.innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    reportAccountSelect.innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  } catch (err) {
    console.error("Error in populateDropdowns:", err);
  }
}
function showNotification(id: string, message: string, duration = 2000) {
  const notification = document.getElementById(id)!;
  notification.textContent = message;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
    notification.textContent = "";
  }, duration);
}
function initialAmount(){
  const amountInput = document.getElementById("paymentAmount") as HTMLInputElement;
  amountInput.value = "100";

}
function setupEventHandlers() {
  setupEditDeleteHandlers();

  initialAmount();;
  document.getElementById("addVendorBtn")?.addEventListener("click", () => {
    try {
      const name = (document.getElementById("vendorName") as HTMLInputElement).value.trim();
      const type = (document.getElementById("vendorType") as HTMLSelectElement).value;
      if (!name) return console.log("Vendor name is required.");

      addVendor(name, type as any);
      populateDropdowns();
      showNotification("addVendorNotification","Vendor added successfully!");
    } catch (err) {
      console.error("Error adding vendor:", err);
      console.log(" See console.");
    }
  });

  document.getElementById("exportVendorsBtn")?.addEventListener("click", () => {
    try {
      exportVendorsToExcel();
    } catch (err) {
      console.error("Error exporting vendors:", err);
    }
  });

  document.getElementById("payBtn")?.addEventListener("click", () => {
    try {
      const vendorId = (document.getElementById("vendorSelect") as HTMLSelectElement).value;
      const amount = parseFloat((document.getElementById("paymentAmount") as HTMLInputElement).value) || 100;
      const accountId = (document.getElementById("accountSelect") as HTMLSelectElement).value;
      console.log(`Proceeding with payment: $${amount} to vendor ${vendorId}`);

      const success = performPayment(vendorId, amount, accountId);
      success ?       showNotification("paymentNotification","Payment successful!"): showNotification("paymentNotification","Insufficient balance.");
      initialAmount();
    } catch (err) {
      console.error("Error during payment:", err);
      console.log("Error processing payment.");
    }
  });

  const reportType = document.getElementById("reportType") as HTMLSelectElement;
  reportType.addEventListener("change", () => {
    const vSelect = document.getElementById("reportVendorSelect")!;
    const aSelect = document.getElementById("reportAccountSelect")!;
    vSelect.style.display = reportType.value === "vendor" ? "inline-block" : "none";
    aSelect.style.display = reportType.value === "account" ? "inline-block" : "none";
  });

  document.getElementById("generateReportBtn")?.addEventListener("click", () => {
    try {
      const type = reportType.value;
      let txns: Transaction[] = [];

      if (type === "all") txns = getAllTransactions();
      else if (type === "vendor") {
        const vid = (document.getElementById("reportVendorSelect") as HTMLSelectElement).value;
        txns = getVendorTransactions(vid);
      } else if (type === "account") {
        const aid = (document.getElementById("reportAccountSelect") as HTMLSelectElement).value;
        txns = getAccountTransactions(aid);
      }

      txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const output = document.getElementById("reportOutput")!;
      output.innerHTML = txns.map(t =>
        `<li>${t.date} — Vendor ${t.vendorId} — $${t.amount} — From ${t.accountId} (${t.type})</li>`
      ).join('');
    } catch (err) {
      console.error("Error generating report:", err);
      console.log("Check console.");
    }
  });
}