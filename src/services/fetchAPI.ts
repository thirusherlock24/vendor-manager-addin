import { LOCAL_USERS } from "../utils/constants";

export async function fetchUsers(): Promise<typeof LOCAL_USERS> {
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