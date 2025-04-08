
import { getVendors, removeVendor } from "../data/local-storage-provider";
import { showNotification } from "../utils/notification";
import { refreshVendorDropdown } from "../services/refresh-vendor-dropdown";
import { populateDropdowns } from "../services/populate-dropdowns";
import { editVendor } from "../services/vendor-service";

export function setupEditDeleteHandlers() {
  const editBtn = document.getElementById("editVendorBtn") as HTMLButtonElement;
  const deleteBtn = document.getElementById("deleteVendorBtn") as HTMLButtonElement;
  const saveBtn = document.getElementById("saveEditedVendorBtn") as HTMLButtonElement;
  const cancelBtn = document.getElementById("cancelEditVendorBtn") as HTMLButtonElement;

 
  
  (document.getElementById("editVendorType") as HTMLSelectElement)?.addEventListener("change", e => {
    try
    {
      const val = (e.target as HTMLSelectElement).value;
    document.getElementById("editScheduleDetails")!.style.display = val === "on-demand" ? "none" : "block";
    }
    catch (err) {
      console.error("Error handling editVendorType change:", err);
    }
  });
  
  editBtn.addEventListener("click", () => {
    try{
    const vendorId = (document.getElementById("vendorList") as HTMLSelectElement).value;
    const vendor = getVendors().find(v => v.id === vendorId);
    if (!vendor) return console.log("Please select a vendor.");
  
    const nameInput = document.getElementById("editVendorName") as HTMLInputElement;
    const typeSelect = document.getElementById("editVendorType") as HTMLSelectElement;
    const amountInput = document.getElementById("editVendorAmount") as HTMLInputElement;
    const accountSelect = document.getElementById("editVendorScheduleAccount") as HTMLSelectElement;
    const scheduleBlock = document.getElementById("editScheduleDetails")!;
  
    nameInput.value = vendor.name;
    typeSelect.value = vendor.type;
    nameInput.dataset.editingId = vendor.id;
  
    if (vendor.type === "weekly" || vendor.type === "alt-weekly") {
      amountInput.value = vendor.scheduleAmount?.toString() || "";
      accountSelect.value = vendor.scheduleAccountId || "acc1";
      scheduleBlock.style.display = "block";
    } else {
      scheduleBlock.style.display = "none";
      amountInput.value = "";
      accountSelect.selectedIndex = 0;
    }
  
    document.getElementById("editVendorForm")!.style.display = "block";
  }
    catch (err) {
      console.error("Error showing editVendorForm:", err);
    }
  });
  deleteBtn.addEventListener("click", () => {
    try {
      const vendorId = (document.getElementById("vendorList") as HTMLSelectElement).value;
      if (!vendorId) return console.log("Select a vendor first.");
  
      removeVendor(vendorId);
      showNotification("editVendorNotification", "Removed Vendor successfully!");
  
      refreshVendorDropdown();
      populateDropdowns();
      document.getElementById("editVendorForm")!.style.display = "none";
    } catch (err) {
      console.error("Error deleting vendor:", err);
    }
  });

  saveBtn.addEventListener("click", () => {
    try {
      const nameInput = document.getElementById("editVendorName") as HTMLInputElement;
      const typeSelect = document.getElementById("editVendorType") as HTMLSelectElement;
      const amountInput = document.getElementById("editVendorAmount") as HTMLInputElement;
      const accountSelect = document.getElementById("editVendorScheduleAccount") as HTMLSelectElement;
    
      const id = nameInput.dataset.editingId;
      const name = nameInput.value.trim();
      const type = typeSelect.value;
      const amount = parseFloat(amountInput.value);
      const accountId = accountSelect.value || "acc1";
    
      if (!id || !name) return showNotification("editVendorNotification", "Vendor name required!");
      if (type !== "on-demand" && (isNaN(amount) || amount <= 0)) {
        return showNotification("editVendorNotification", "Amount must be greater than zero!");
      }  
      if (type === "on-demand") {
        editVendor(id, name, type as any);
      } else {
        editVendor(id, name, type as any, amount, accountId);
      }
    
      populateDropdowns();
      refreshVendorDropdown();
      showNotification("editVendorNotification", "Vendor updated.");
      document.getElementById("editVendorForm")!.style.display = "none";
    } catch (err) {
      console.error("Error saving edited vendor:", err);
    }
  });

  cancelBtn.addEventListener("click", () => {
    try {
      document.getElementById("editVendorForm")!.style.display = "none";
    } catch (err) {
      console.error("Error hiding editVendorForm on cancel:", err);
    }
  });
}
