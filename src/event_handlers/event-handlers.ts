import { addVendor, exportVendorsToExcel } from "../services/vendor-service";
import { performPayment } from "../services/payment-service";
import { getAllTransactions, getVendorTransactions, getAccountTransactions, getOnDemandTransactions, getScheduledTransactions } from "../ui/report-service";
import { Transaction } from "../models/models";
import { showNotification } from "../utils/notification";
import { populateDropdowns } from "../services/populate-dropdowns";
import { setupEditDeleteHandlers } from "../edit_delete/edit-delete-handlers";
import { exportTransactionsToExcel } from "../services/export-tansactions";

function initialAmount(){
    const amountInput = document.getElementById("paymentAmount") as HTMLInputElement;
    amountInput.value = "100";
  
  }
  
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
  
    initialAmount();;
    (document.getElementById("vendorType") as HTMLSelectElement)?.addEventListener("change", e => {
      const val = (e.target as HTMLSelectElement).value;
      document.getElementById("scheduleDetails")!.style.display = val === "on-demand" ? "none" : "block";
    });
    document.getElementById("vendorType")?.addEventListener("change", e => {
      const value = (e.target as HTMLSelectElement).value;
      document.getElementById("scheduleDetails")!.style.display = value === "on-demand" ? "none" : "block";
    });
    document.getElementById("addVendorBtn")?.addEventListener("click", () => {
      try {
        const name = (document.getElementById("vendorName") as HTMLInputElement).value.trim();
        const type = (document.getElementById("vendorType") as HTMLSelectElement).value;
        const amount = parseFloat((document.getElementById("vendorAmount") as HTMLInputElement).value || "100");
        const accountId = (document.getElementById("vendorScheduleAccount") as HTMLSelectElement).value;
    
        if (!name) return showNotification("addVendorNotification", "Vendor name is required!");
    
        if (type === "on-demand") {
          addVendor(name, type as any);
        } else {
          addVendor(name, type as any, amount, accountId);
        }
    
        populateDropdowns();
        showNotification("addVendorNotification", "Vendor added successfully!");
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
        else if (type === "onDemand") {
          txns = getOnDemandTransactions();
        }
        else if (type === "scheduled") {
          txns = getScheduledTransactions();
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