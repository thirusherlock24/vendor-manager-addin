import { getAccountDetails } from "../ui/report-service";

export function exportAccountsToExcel() {
  try{
    Excel.run(async context => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const usedRange = sheet.getUsedRange();
      usedRange.clear();
  
      const timestamp = new Date().toLocaleString();
  
      const accounts = getAccountDetails(); 
  
      const header = ["Account ID", "Account Name", "Balance ($)"];
      const rows = accounts.map(a => [a.id, a.name, a.balance]);
      const footer = [
        ["", "", ""], 
        [`Report generated at: ${timestamp}`, "", ""]
      ];
  
      const data: (string | number)[][] = [header, ...rows, ...footer];
  
      const range = sheet.getRange(`A1:C${data.length}`);
      range.values = data;
  
      sheet.getRange("A1:C1").format.font.bold = true;
  
      await context.sync();
    });
  }
  catch (err) {
    console.error("Error exporting accounts to Excel:", err);
  }
}