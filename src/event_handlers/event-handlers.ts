import { addVendor, exportVendorsToExcel } from "../services/vendor-service";
import { performPayment } from "../services/payment-service";
import { getAllTransactions, getVendorTransactions, getAccountTransactions, getOnDemandTransactions, getScheduledTransactions } from "../ui/report-service";
import { Transaction } from "../models/models";
import { showNotification } from "../utils/notification";
import { populateDropdowns } from "../services/populate-dropdowns";
import { setupEditDeleteHandlers } from "../edit_delete/edit-delete-handlers";
import { exportTransactionsToExcel } from "../services/export-tansactions";
import { exportAccountsToExcel } from "../services/export-accounts";


  
export function setupEventHandlers() {
    try {
      Excel.run(async context => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const usedRange = sheet.getUsedRange();
        usedRange.clear();
      });
    } catch (err) {
      console.error("Error interacting with Excel:", err);
    }
      
  
    setupEditDeleteHandlers();
  
    
    document.getElementById("vendorType")?.addEventListener("change", e => {
      try {
        const value = (e.target as HTMLSelectElement).value;
        document.getElementById("scheduleDetails")!.style.display = value === "on-demand" ? "none" : "block";
      } catch (err) {
        console.error("Error handling vendorType change:", err);
      }
    });
    document.getElementById("addVendorBtn")?.addEventListener("click", () => {
      try {
        const nameInput = document.getElementById("vendorName") as HTMLInputElement;
        const typeSelect = document.getElementById("vendorType") as HTMLSelectElement;
        const amountInput = document.getElementById("vendorAmount") as HTMLInputElement;
        const accountSelect = document.getElementById("vendorScheduleAccount") as HTMLSelectElement;
      
        const name = nameInput.value.trim();
        const type = typeSelect.value;
        const amount = parseFloat(amountInput.value);
        const accountId = accountSelect.value;
      
        if (!name) return showNotification("addVendorNotification", "Vendor name is required!");
        if (type !== "on-demand" && (isNaN(amount) || amount <= 0)) {
          return showNotification("addVendorNotification", "Amount must be greater than zero!");
        }      
        if (type === "on-demand") {
          addVendor(name, type as any);
        } else {
          addVendor(name, type as any, amount, accountId);
        }
      
        populateDropdowns();
        showNotification("addVendorNotification", "Vendor added successfully!");
      
        nameInput.value = "";
        amountInput.value = "";
      
      } catch (err) {
        console.error("Error adding vendor:", err);
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
        const amountInput = document.getElementById("paymentAmount") as HTMLInputElement;

        const amount = parseFloat((document.getElementById("paymentAmount") as HTMLInputElement).value);
        const accountId = (document.getElementById("accountSelect") as HTMLSelectElement).value;
        if (!vendorId) {
          showNotification("paymentNotification", "Please select a vendor.");
          return;
        }
      
        if ((isNaN(amount) || amount <= 0)) {
          showNotification("paymentNotification", "Amount must be greater than zero.");
          return;
        }
        console.log(`Proceeding with payment: $${amount} to vendor ${vendorId}`);
  
        const success = performPayment(vendorId, amount, accountId);
        if (success) {
          showNotification("paymentNotification", "Payment successful!");
          amountInput.value = ""; 
        } else {
          showNotification("paymentNotification", "Insufficient balance.");
        }      } catch (err) {
        console.error("Error during payment:", err);
        console.log("Error processing payment.");
      }
    });
  
    const reportType = document.getElementById("reportType") as HTMLSelectElement;
    reportType.addEventListener("change", () => {
      try {
        const vSelect = document.getElementById("reportVendorSelect")!;
        const aSelect = document.getElementById("reportAccountSelect")!;
        vSelect.style.display = reportType.value === "vendor" ? "inline-block" : "none";
        aSelect.style.display = reportType.value === "account" ? "inline-block" : "none";
      } catch (err) {
        console.error("Error in reportType change handler:", err);
      }
    });
  
    document.getElementById("generateReportBtn")?.addEventListener("click", () => {
     
      try {
        const type = reportType.value;
        let txns: Transaction[] = [];
  
        if (type === "all") txns = getAllTransactions();
        else if (type === "vendor") {
            const vid = (document.getElementById("reportVendorSelect") as HTMLSelectElement).value;
            if (!vid) {
            showNotification("reportNotification", "please select a vendor.");
            return;
            }
            txns = getVendorTransactions(vid);
        } else if (type === "account") {
          const aid = (document.getElementById("reportAccountSelect") as HTMLSelectElement).value;
          txns = getAccountTransactions(aid);
        }
        else if (type === "onDemand") {
          txns = getOnDemandTransactions();
        }
        else if (type === "scheduled") {
          txns = getScheduledTransactions();
        }
        else if (type === "balance")
        {
          exportAccountsToExcel();
          return;
        }
  
        txns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        exportTransactionsToExcel(txns); 
  
        // const output = document.getElementById("reportOutput")!;
        // output.innerHTML = txns.map(t =>
        //   `<li>${t.date} — Vendor ${t.vendorId} — $${t.amount} — From ${t.accountId} (${t.type})</li>`
        // ).join('');
      } catch (err) {
        console.error("Error generating report:", err);
        console.log("Check console.");
      }
    });
  }