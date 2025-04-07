export function showNotification(id: string, message: string, duration = 2000) {
    const notification = document.getElementById(id)!;
    notification.textContent = message;
    notification.style.display = "block";
  
    setTimeout(() => {
      notification.style.display = "none";
      notification.textContent = "";
    }, duration);
  }