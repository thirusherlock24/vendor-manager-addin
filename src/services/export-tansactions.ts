import { Transaction } from "../models/models";
export function exportTransactionsToExcel(txns: Transaction[]) {
    Excel.run(async context => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const usedRange = sheet.getUsedRange();
      usedRange.clear();
      const data = [
        ["Date", "Vendor ID", 
          "Vendor Name", "Amount", "Account ID", "Type"],
        ...txns.map(t => [t.date, t.vendorId, t.vendorName, t.amount, t.accountId, t.type])
      ];
  
      const range = sheet.getRange(`A1:F${data.length}`);
      range.values = data;
      await context.sync();
    });
  }