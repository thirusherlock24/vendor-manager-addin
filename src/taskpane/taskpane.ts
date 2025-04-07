import { getVendors, getAccounts, initializeAccounts, removeVendor, saveVendors} from "../data/local-storage-provider";
import { addVendor, editVendor, exportVendorsToExcel } from "../services/vendor-service";
import { performPayment } from "../services/payment-service";
import { getAllTransactions, getVendorTransactions, getAccountTransactions, getOnDemandTransactions, getScheduledTransactions } from "../ui/report-service";
import { Transaction } from "../models/models";



const LOCAL_USERS = [
  {
    username: "admin",
    passwordHash: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
  }
];

const SESSION_DURATION_MS = 30 * 60 * 1000; 

function isAuthenticated(): boolean {
  const token = localStorage.getItem("authToken");
  const expiry = localStorage.getItem("authExpiry");

  if (!token || !expiry) return false;

  if (Date.now() > parseInt(expiry)) {
    logout();
    return false;
  }

  return true;
}
async function fetchUsers(): Promise<typeof LOCAL_USERS> {
  try {
    const response = await fetch("https://vendor-manager-addin.vercel.app/api/users.json");
    if (!response.ok) throw new Error("Network response was not ok");
    const users = await response.json();
    console.log("Fetched users:", users);
    return users;
  } catch (error) {
    console.warn("Using local users due to fetch failure:", error);
    return LOCAL_USERS;
  }
}
function showLoginState(isLoggedIn: boolean) {
  const loginForm = document.getElementById("login-form");
  const logoutForm = document.getElementById("logout-form");
  const mainUI = document.getElementById("main-ui");

  if (loginForm) loginForm.style.display = isLoggedIn ? "none" : "block";
  if (logoutForm) logoutForm.style.display = isLoggedIn ? "block" : "none";
  if (mainUI) mainUI.style.display = isLoggedIn ? "block" : "none";
}

async function hashText(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function login() {
  const usernameInput = (document.getElementById("usernameInput") as HTMLInputElement).value;
  const passwordInput = (document.getElementById("passwordInput") as HTMLInputElement).value;
  const loginNotif = document.getElementById("loginNotification")!;

  const hashedPassword = await hashText(passwordInput);
  const usersData = await fetchUsers();
  const user = usersData.find(u => u.username === usernameInput && u.passwordHash === hashedPassword);

  if (user) {
    const expiry = new Date().getTime() + SESSION_DURATION_MS;
    localStorage.setItem("authToken", "mock-auth-token");
    localStorage.setItem("authExpiry", expiry.toString());
    showLoginState(true);
    loginNotif.innerHTML = "";
    loginNotif.style.display = "none";
  } else {
    loginNotif.innerHTML = "Invalid username or password.";
    loginNotif.style.display = "block";
  }
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authExpiry");
  showLoginState(false);
}


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
let simulatedDay = 0; 

setInterval(() => {
  simulateDay();
}, 10000); 

function simulateDay() {
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
function refreshVendorDropdown() {
  const vendors = getVendors();
  const list = document.getElementById("vendorList") as HTMLSelectElement;
  list.innerHTML = vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
}

function setupEditDeleteHandlers() {
  const editBtn = document.getElementById("editVendorBtn") as HTMLButtonElement;
  const deleteBtn = document.getElementById("deleteVendorBtn") as HTMLButtonElement;
  const saveBtn = document.getElementById("saveEditedVendorBtn") as HTMLButtonElement;
  const cancelBtn = document.getElementById("cancelEditVendorBtn") as HTMLButtonElement;

 
  
  (document.getElementById("editVendorType") as HTMLSelectElement)?.addEventListener("change", e => {
    const val = (e.target as HTMLSelectElement).value;
    document.getElementById("editScheduleDetails")!.style.display = val === "on-demand" ? "none" : "block";
  });
  editBtn.addEventListener("click", () => {
    const vendorId = (document.getElementById("vendorList") as HTMLSelectElement).value;
    const vendor = getVendors().find(v => v.id === vendorId);
    if (!vendor) return console.log("Please select a vendor.");

    const nameInput = document.getElementById("editVendorName") as HTMLInputElement;
    const typeSelect = document.getElementById("editVendorType") as HTMLSelectElement;

    nameInput.value = vendor.name;
    typeSelect.value = vendor.type;
    nameInput.dataset.editingId = vendor.id;

    document.getElementById("editVendorForm")!.style.display = "block";
  });

  deleteBtn.addEventListener("click", () => {
    const vendorId = (document.getElementById("vendorList") as HTMLSelectElement).value;
    if (!vendorId) return console.log("Select a vendor first.");
      removeVendor(vendorId);
      showNotification("editVendorNotification","Removed Vendor successfully!");

      refreshVendorDropdown();
      populateDropdowns();
      document.getElementById("editVendorForm")!.style.display = "none";
    
  });

  saveBtn.addEventListener("click", () => {
    const nameInput = document.getElementById("editVendorName") as HTMLInputElement;
    const typeSelect = document.getElementById("editVendorType") as HTMLSelectElement;
    const amountInput = document.getElementById("editVendorAmount") as HTMLInputElement;
    const accountSelect = document.getElementById("editVendorScheduleAccount") as HTMLSelectElement;
  
    const id = nameInput.dataset.editingId;
    const name = nameInput.value.trim();
    const type = typeSelect.value;
    const amount = parseFloat(amountInput.value || "100");
    const accountId = accountSelect.value || "acc1";
  
    if (!id || !name) return showNotification("editVendorNotification", "Vendor name required!");
  
    if (type === "on-demand") {
      editVendor(id, name, type as any);
    } else {
      editVendor(id, name, type as any, amount, accountId);
    }
  
    populateDropdowns();
    refreshVendorDropdown();
    showNotification("editVendorNotification", "Vendor updated.");
    document.getElementById("editVendorForm")!.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
    document.getElementById("editVendorForm")!.style.display = "none";
  });
}

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
if (sectionId === "viewSection") refreshVendorDropdown();


}
(window as any).showSection = showSection;

function populateDropdowns() {
  try {
    const vendors = getVendors();
    const accounts = getAccounts();

    const vendorSelect = document.getElementById("vendorSelect") as HTMLSelectElement;
    const reportVendorSelect = document.getElementById("reportVendorSelect") as HTMLSelectElement;
    const accountSelect = document.getElementById("accountSelect") as HTMLSelectElement;
    const reportAccountSelect = document.getElementById("reportAccountSelect") as HTMLSelectElement;

    vendorSelect.innerHTML = vendors
      .filter(v => v.type === "on-demand")
      .map(v => `<option value="${v.id}">${v.name}</option>`)
      .join('');
    reportVendorSelect.innerHTML = vendors.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    accountSelect.innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    reportAccountSelect.innerHTML = accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  } catch (err) {
    console.error("Error in populateDropdowns:", err);
  }
}
function showNotification(id: string, message: string, duration = 2000) {
  const notification = document.getElementById(id)!;
  notification.textContent = message;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
    notification.textContent = "";
  }, duration);
}
function initialAmount(){
  const amountInput = document.getElementById("paymentAmount") as HTMLInputElement;
  amountInput.value = "100";

}
function setupEventHandlers() {
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