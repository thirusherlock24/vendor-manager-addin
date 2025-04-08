export async function hashText(text: string): Promise<string> {
  try {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (err) {
    console.error("Error hashing text:", err);
    throw new Error("Failed to hash the input text");
  }
}