import { Vendor } from "../models/models";
import { getVendors, saveVendors } from "../data/local-storage-provider";

export function addVendor(name: string, type: Vendor["type"]): Vendor {
  const vendors = getVendors();
  const newVendor: Vendor = { id: `v-${Date.now()}`, name, type };
  vendors.push(newVendor);
  saveVendors(vendors);
  return newVendor;
}

export function exportVendorsToExcel() {
  const vendors = getVendors();
  Excel.run(async context => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const data = [["ID", "Name", "Type"], ...vendors.map(v => [v.id, v.name, v.type])];
    const range = sheet.getRange(`A1:C${data.length}`);
    range.values = data;
    await context.sync();
  });
}