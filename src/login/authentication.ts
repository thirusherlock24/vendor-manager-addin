import { hashText } from "../utils/hash-text";
import { fetchUsers } from "../services/fetchAPI";
import { SESSION_DURATION_MS } from "../utils/constants";


export function isAuthenticated(): boolean {
  const token = localStorage.getItem("authToken");
  const expiry = localStorage.getItem("authExpiry");

  if (!token || !expiry) return false;

  if (Date.now() > parseInt(expiry)) {
    logout();
    return false;
  }

  return true;
}

export function logout() {
    const usernameInput = (document.getElementById("usernameInput") as HTMLInputElement);
    const passwordInput = (document.getElementById("passwordInput") as HTMLInputElement);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authExpiry");
    usernameInput.value = "";
    passwordInput.value = "";
    showLoginState(false);
  }

 export function showLoginState(isLoggedIn: boolean) {
    const loginForm = document.getElementById("login-form");
    const logoutForm = document.getElementById("logout-form");
    const mainUI = document.getElementById("main-ui");
  
    if (loginForm) loginForm.style.display = isLoggedIn ? "none" : "block";
    if (logoutForm) logoutForm.style.display = isLoggedIn ? "block" : "none";
    if (mainUI) mainUI.style.display = isLoggedIn ? "block" : "none";
  }

export async function login() {
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