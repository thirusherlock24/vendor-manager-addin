import { Transaction } from "../models/models";
export function exportTransactionsToExcel(txns: Transaction[]) {
  try{
    Excel.run(async context => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const usedRange = sheet.getUsedRange();
      usedRange.clear();
      const timestamp = new Date().toLocaleString();

      const header = ["Date", "Vendor ID", "Vendor Name", "Amount", "Account ID", "Type"];
      const rows = txns.map(t => [t.date, t.vendorId, t.vendorName, t.amount, t.accountId, t.type]);
      const footer = [
        ["", "", "", "", "", ""], 
        [`Report generated at: ${timestamp}`, "", "", "", "", ""]
      ];
      
      const data: (string | number)[][] = [header, ...rows, ...footer];
      const range = sheet.getRange(`A1:F${data.length}`);
      range.values = data;
      sheet.getRange("A1:F1").format.font.bold = true;

      await context.sync();
    });
  }
  catch (err) {
    console.error("Error exporting transactions to Excel:", err);
  }
}