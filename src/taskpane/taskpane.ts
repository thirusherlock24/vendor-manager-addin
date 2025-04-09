import { initializeAccounts} from "../data/local-storage-provider";
import { isAuthenticated, showLoginState, login, logout } from "../login/authentication";
import { simulateDay } from "../schedule_payment/simulate-day";
import { refreshVendorDropdown } from "../services/refresh-vendor-dropdown";
import { populateDropdowns } from "../services/populate-dropdowns";
import { setupEventHandlers } from "../event_handlers/event-handlers";
window.onload = () => {
  Office.onReady(() => {
    showLoginState(isAuthenticated());
    document.getElementById("loginBtn")?.addEventListener("click", login);
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    initializeAccounts();
    populateDropdowns();
    setupEventHandlers();
    showSection("homePage");
  });
};

setInterval(() => {
  simulateDay();
}, 10000); 

function showSection(sectionId: string) {
  if (!isAuthenticated()) {
    showLoginState(false);
    return;
  }
  const sections = ["homePage", "vendorSection", "paymentSection", "reportSection", "viewSection"];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === sectionId ? "block" : "none";
  });


}
(window as any).showSection = showSection;