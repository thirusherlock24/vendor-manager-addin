import { getVendors, saveVendors} from "../data/local-storage-provider";
import { performPayment } from "../services/payment-service";

let simulatedDay = 0; 

export function simulateDay() {
  simulatedDay++;
  const vendors = getVendors();

  vendors.forEach(vendor => {
    const { id, type, scheduleAmount = 100, scheduleAccountId = "acc1", lastPaidDay = 0 } = vendor;
    if (type === "on-demand") return;

    if (type === "weekly" && simulatedDay % 7 === 5) {
      if (lastPaidDay !== simulatedDay) {
        const paid = performPayment(id, scheduleAmount, scheduleAccountId);
        if (paid) {
          vendor.lastPaidDay = simulatedDay;
          console.log(`Paid ${vendor.name} [Weekly] on day ${simulatedDay}`);
        }
      }
    }

    if (type === "alt-weekly" && simulatedDay % 14 === 5) {
      if (lastPaidDay !== simulatedDay) {
        const paid = performPayment(id, (scheduleAmount || 100) * 2, scheduleAccountId || "acc1");
        if (paid) {
          vendor.lastPaidDay = simulatedDay;
          console.log(`Paid ${vendor.name} [Alt-Weekly] on day ${simulatedDay}`);
        }
      }
    }
  });

  saveVendors(vendors);
}