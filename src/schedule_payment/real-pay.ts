import { getVendors, saveVendors } from "../data/local-storage-provider";
import { performPayment } from "../services/payment-service";

export function realScheduler() {
    const today = new Date();
    const isFriday = today.getDay() === 5;
    if (!isFriday) return;
  
    const todayDate = parseInt(today.toISOString().slice(0, 10).replace(/-/g, '')); 
    const vendors = getVendors();
  
    vendors.forEach(vendor => {
      const { id, name, type, scheduleAmount = 100, scheduleAccountId = "acc1", lastPaidDay, skip = 0 } = vendor;
      const lastDay = typeof lastPaidDay === "string" ? parseInt(lastPaidDay.replace(/-/g, '')) : lastPaidDay;
      if (type === "on-demand") return;

      if (type === "weekly") {
        if (lastDay !== todayDate) {
          const paid = performPayment(id, scheduleAmount, scheduleAccountId);
          if (paid) {
            vendor.lastPaidDay = todayDate;
            console.log(`Paid ${name} Weekly on ${todayDate}`);
          }
        }
      }
  
      if (type === "alt-weekly") {
        if (lastDay !== todayDate) {
          if (skip === 0) {
            vendor.skip = 1;
            console.log(`Skipping ${name} Alt-Weekly this week.`);
          } else {
            const paid = performPayment(id, scheduleAmount, scheduleAccountId);
            if (paid) {
              vendor.lastPaidDay = todayDate;
              vendor.skip = 0;
              console.log(`Paid ${name} Alt-Weekly on ${todayDate}`);
            }
          }
        }
      }
    });
  
    saveVendors(vendors);
  }