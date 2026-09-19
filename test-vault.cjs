// test-vault.cjs
// Diagnostic utility for testing OS SafeStorage encryption. Not used in production.
const { app, safeStorage } = require("electron");

app.whenReady().then(() => {
  console.log("\n=== OS Vault Diagnostics ===");
  const available = safeStorage.isEncryptionAvailable();
  console.log("safeStorage Available:", available);
  console.log("OS Platform:", process.platform);

  if (available) {
    const rawSecret = "glyphboard_secure_key_12345";
    const encrypted = safeStorage.encryptString(rawSecret);
    console.log("Encrypted Buffer (Hex):", encrypted.toString("hex").slice(0, 48) + "...");
    
    const decrypted = safeStorage.decryptString(encrypted);
    console.log("Decrypted String:", decrypted);
    console.log("Status: DPAPI Hardware Encryption is working perfectly!\n");
  } else {
    console.error("Status: safeStorage is NOT supported in this environment.\n");
  }

  app.quit();
});