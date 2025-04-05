import { Vendor } from "../models/models";
import { getVendors, saveVendors } from "../data/local-storage-provider";

export function addVendor(
  name: string,
  type: "weekly" | "alt-weekly" | "on-demand",
  scheduleAmount?: number,
  scheduleAccountId?: string
) {
  const vendors = getVendors();
  const newVendor: Vendor = {
    id: "v" + Date.now(),
    name,
    type,
    scheduleAmount: type === "on-demand" ? undefined : scheduleAmount,
    scheduleAccountId: type === "on-demand" ? undefined : scheduleAccountId,
    lastPaidDay: undefined, // used for tracking schedule payment
  };
  vendors.push(newVendor);
  saveVendors(vendors);
}
export function editVendor(
  id: string,
  newName: string,
  newType: "weekly" | "alt-weekly" | "on-demand",
  scheduleAmount?: number,
  scheduleAccountId?: string
) {
  const vendors = getVendors();
  const index = vendors.findIndex(v => v.id === id);
  if (index > -1) {
    vendors[index].name = newName;
    vendors[index].type = newType;

    if (newType === "on-demand") {
      vendors[index].scheduleAmount = undefined;
      vendors[index].scheduleAccountId = undefined;
      vendors[index].lastPaidDay = undefined;
    } else {
      vendors[index].scheduleAmount = scheduleAmount;
      vendors[index].scheduleAccountId = scheduleAccountId;
      vendors[index].lastPaidDay = vendors[index].lastPaidDay ?? undefined;
    }

    saveVendors(vendors);
  }
}
export function exportVendorsToExcel() {
  const vendors = getVendors();
  Excel.run(async context => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const usedRange = sheet.getUsedRange();
    usedRange.clear();
    const data = [["ID", "Name", "Type", "Scheduled Amount", "Scheduled AccountID", "Last PayDay"], 
      ...vendors.map(v => [
      v.id, 
      v.name, 
      v.type, 
      v.scheduleAmount ?? "N/A", 
      v.scheduleAccountId ?? "N/A", 
      v.lastPaidDay ?? "N/A"
      ])
    ];
    const range = sheet.getRange(`A1:F${data.length}`);
    range.values = data;
    await context.sync();
  });
}