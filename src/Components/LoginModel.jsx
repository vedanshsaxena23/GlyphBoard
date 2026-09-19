// src/Components/LoginModel.jsx
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { setStorageEngine as activateStorageEngine } from "../utilities/db.mjs";

const saltRounds = 10;

async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, saltRounds);
}

async function verifyPassword(enteredPassword, storedHash) {
  try {
    if (!enteredPassword || !storedHash) return false;
    return await bcrypt.compare(enteredPassword, storedHash);
  } catch (err) {
    console.error("Error verifying password:", err);
    return false;
  }
}

function verifyTOTP(token, secretBase32) {
  const totp = new OTPAuth.TOTP({
    issuer: "GlyphBoard",
    label: "GlyphBoard Account",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });

  return totp.validate({ token, window: 1 }) !== null;
}

export default function LoginModal({ onLoginSuccess }) {
  const [existingUser, setExistingUser] = useState(null);
  const [loadingVault, setLoadingVault] = useState(true);
  const [mode, setMode] = useState("register"); // "unlock" | "register" | "enroll"

  // Registration state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  // Renamed setter to avoid shadowing the db utility
  const [storageEngine, setStorageEngineChoice] = useState("sqlite");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Unlock state
  const [unlockPassword, setUnlockPassword] = useState("");

  // TOTP state
  const [totpSecret, setTotpSecret] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [hashedPass, setHashedPass] = useState(null);
  const [error, setError] = useState("");

  // 1. Check for existing profile in OS SafeStorage on launch (single effect)
  useEffect(() => {
    async function loadUserVault() {
      try {
        if (window.electron?.vault) {
          const user = await window.electron.vault.load();
          if (user) {
            setExistingUser(user);
            setMode("unlock");

            const engine = user.storageEngine || "sqlite";
            localStorage.setItem("glyph_storage_mode", engine);
            return;
          }
        }
        setMode("register");
      } catch (err) {
        console.error("Failed to load user vault:", err);
        setMode("register");
      } finally {
        setLoadingVault(false);
      }
    }

    loadUserVault();
  }, []);

  // 2. Generate TOTP secret & QR Code upon enrollment step
  useEffect(() => {
    if (mode === "enroll") {
      const secret = new OTPAuth.Secret({ size: 20 });
      const base32 = secret.base32;
      setTotpSecret(base32);

      const totp = new OTPAuth.TOTP({
        issuer: "GlyphBoard",
        label: email.trim() || name.trim() || "Account",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
      });

      QRCode.toDataURL(totp.toString(), {
        width: 180,
        margin: 1,
        color: { dark: "#6a0dad", light: "#ede7f6" },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => {
          console.error("QR Generation Error:", err);
          setError("Failed to render QR code. Use the manual entry code.");
        });
    }
  }, [mode]);

  // Step 1: Validate Registration Inputs & Hash Passphrase
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !designation.trim()) {
      setError("Please fill in all required profile fields.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Passphrase must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passphrases do not match.");
      return;
    }

    try {
      const finalPassword = await hashPassword(password);
      setHashedPass(finalPassword);
      setMode("enroll");
    } catch (err) {
      setError("Failed to encrypt passphrase. Please try again.");
      console.error(err);
    }
  };

  // Step 2: Validate Initial 2FA, Save Profile, and Unlock Engine
  const handleEnrollVerify = async (e) => {
    e.preventDefault();
    setError("");

    const isValid = verifyTOTP(totpToken.trim(), totpSecret);
    if (!isValid) {
      setError("Invalid 6-digit code. Check your authenticator app.");
      return;
    }

    if (storageEngine === "sqlite" && window.electron?.db?.purge) {
      try {
        await window.electron.db.purge();
      } catch (purgeErr) {
        console.warn("Pre-registration database wipe warning:", purgeErr);
      }
    }
    
    const newProfile = {
      name: name.trim(),
      email: email.trim(),
      designation: designation.trim(),
      storageEngine,
      password: hashedPass, // Bcrypt hash
      totpSecret,           // DPAPI protected
    };

    if (window.electron?.vault) {
      const saved = await window.electron.vault.save(newProfile);
      if (!saved) {
        setError("Failed to save credentials to OS vault. Check main process logs.");
        return;
      }
    } else {
      setError("OS hardware security bridge not found. Ensure preload.cjs is connected.");
      return;
    }

    try {
      if (storageEngine === "sqlite") {
        await activateStorageEngine("sqlite", { password });
      } else {
        await activateStorageEngine("indexeddb");
      }
    } catch (dbErr) {
      console.error("Storage unlock error during registration:", dbErr);
      setError("Failed to initialize storage: " + dbErr.message);
      return;
    }

    onLoginSuccess(newProfile);
  };

  // Step 3: Returning User Unlock (Password + TOTP) -> UNLOCK DATABASE IN RAM
  const handleUnlockVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!unlockPassword) {
      setError("Please enter your Master Passphrase.");
      return;
    }

    const isPassValid = await verifyPassword(unlockPassword, existingUser.password);
    if (!isPassValid) {
      setError("Incorrect Master Passphrase.");
      return;
    }

    const isOtpValid = verifyTOTP(totpToken.trim(), existingUser.totpSecret);
    if (!isOtpValid) {
      setError("Invalid 6-digit code. Check your authenticator app.");
      return;
    }

    try {
      const engine = existingUser.storageEngine || "sqlite";
      if (engine === "sqlite") {
        await activateStorageEngine("sqlite", { password: unlockPassword });
      } else {
        await activateStorageEngine("indexeddb");
      }
    } catch (dbErr) {
      console.error("Storage unlock error:", dbErr);
      setError("Database unlock error: " + dbErr.message);
      return;
    }

    onLoginSuccess(existingUser);
  };


  // Profile reset: clears hardware vault file and purges physical database & keys
  const handleResetProfile = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (
      !window.confirm(
        "Reset profile on this device? This will erase your saved credentials, local database, and snippets."
      )
    ) {
      return;
    }

    console.log("================ [RESET STARTED] ================");

    // Step 1: Wipe session keys
    try {
      lockStorage();
      console.log("Step 1/5: lockStorage() executed.");
    } catch (err) {
      console.error("Step 1/5: lockStorage() error:", err?.stack || err?.message || err);
    }

    // Step 2: Wipe SQLite
    try {
      if (window.electron?.db?.purge) {
        const purgeRes = await window.electron.db.purge();
        console.log("Step 2/5: SQLite purged successfully. Result:", purgeRes);
      } else {
        console.warn("Step 2/5: window.electron.db.purge not defined.");
      }
    } catch (err) {
      console.error("Step 2/5: SQLite purge error:", err?.stack || err?.message || err);
    }

    // Step 3: Wipe OS Vault
    try {
      if (window.electron?.vault?.save) {
        const vaultRes = await window.electron.vault.save(null);
        console.log("Step 3/5: Vault cleared. Result:", vaultRes);
      } else {
        console.warn("Step 3/5: window.electron.vault.save not defined.");
      }
    } catch (err) {
      console.error("Step 3/5: Vault save error:", err?.stack || err?.message || err);
    }

    // Step 4: Wipe IndexedDB
    try {
      const DB_NAME = "GlyphBoardDB";
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

      await new Promise((resolve) => {
        deleteRequest.onsuccess = () => {
          console.log("Step 4/5: IndexedDB deleted successfully.");
          resolve();
        };
        deleteRequest.onerror = (ev) => {
          console.error("Step 4/5: IndexedDB delete failed:", ev?.target?.error?.message || "Unknown error");
          resolve();
        };
        deleteRequest.onblocked = () => {
          console.warn("Step 4/5: IndexedDB deletion blocked by an open connection.");
          resolve();
        };
      });
    } catch (err) {
      console.error("Step 4/5: IndexedDB wipe exception:", err?.stack || err?.message || err);
    }

    // Step 5: Wipe DOM Storage
    try {
      localStorage.removeItem("gb_session_user");
      localStorage.removeItem("glyph_storage_mode");
      console.log("Step 5/5: localStorage cleared.");
    } catch (err) {
      console.error("Step 5/5: localStorage clear error:", err?.message || err);
    }

    console.log("================ [RESET COMPLETE - RELOADING] ================");

    window.location.hash = "#/";
    window.location.reload();
  };

  if (loadingVault) {
    return null;
  }

  return (
    <div className="flex justify-center min-w-[98.5vw] min-h-[98.5vh] bg-[url('/bg.jpg')] bg-cover bg-center overflow-hidden rounded-2xl">
      <div className="flex justify-center items-center min-w-[98.5vw] min-h-[98.5vh] backdrop-blur-sm bg-black/40 overflow-hidden rounded-2xl p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex max-h-[92vh] w-full max-w-4xl bg-zinc-950/95 border border-zinc-800/80 shadow-2xl overflow-hidden rounded-2xl"
        >
          {/* Side Panel */}
          <div className="hidden md:flex flex-col justify-between bg-[url('/bg.jpg')] bg-cover bg-center w-80 m-2 rounded-xl overflow-hidden p-6 border border-zinc-800/50">
            <span className="text-xs font-mono tracking-widest text-zinc-300 uppercase bg-black/40 px-3 py-1 rounded-md backdrop-blur-md self-start">
              GlyphBoard
            </span>
            <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl text-xs text-zinc-300 space-y-1">
              <p className="font-semibold text-zinc-100">
                {mode === "unlock" ? "Session Locked" : "Hardware Security"}
              </p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                {mode === "unlock"
                  ? `Authenticate to open your workspace for ${existingUser?.name || "your account"}.`
                  : "Set up encrypted storage and pair your device with an RFC 6238 authenticator app."}
              </p>
            </div>
          </div>

          {/* Form Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-zinc-100 flex flex-col justify-center">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full max-w-md mx-auto flex flex-col gap-5"
            >
              {/* Header */}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                  {mode === "unlock" ? "Welcome Back" : mode === "register" ? "Get Started" : "Pair Authenticator"}
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  {mode === "unlock"
                    ? "Workspace locked. Authenticate to proceed."
                    : mode === "register"
                    ? "Set up your profile and storage engine."
                    : "Scan the QR code to finish setting up 2FA."}
                </p>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
                  {error}
                </div>
              )}

              {/* 1. RETURNING USER: UNLOCK */}
              {mode === "unlock" && (
                <form className="flex flex-col gap-4" onSubmit={handleUnlockVerify}>
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{existingUser?.name}</p>
                      <p className="text-[11px] text-zinc-500">{existingUser?.email || existingUser?.designation}</p>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-md">
                      {existingUser?.storageEngine}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Master Passphrase *
                    </label>
                    <input
                      type="password"
                      required
                      autoFocus
                      value={unlockPassword}
                      onChange={(e) => setUnlockPassword(e.target.value)}
                      placeholder="Enter your passphrase"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      6-Digit Authenticator Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      required
                      value={totpToken}
                      onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full px-3.5 py-3 text-center font-mono tracking-widest text-lg bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#5B44C7] hover:bg-[#4a35ab] active:scale-[0.99] text-white font-medium text-xs py-3 rounded-xl transition shadow-lg shadow-purple-900/20 cursor-pointer"
                  >
                    Unlock Workspace
                  </button>

                  <button
                    type="button"
                    onClick={handleResetProfile}
                    className="text-center text-[11px] text-zinc-500 hover:text-red-400 transition underline cursor-pointer mt-1"
                  >
                    Not you? Reset local profile
                  </button>
                </form>
              )}

              {/* 2. REGISTRATION */}
              {mode === "register" && (
                <form className="flex flex-col gap-4" onSubmit={handleRegisterSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Mercer"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="Frontend Lead"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.dev"
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Storage Architecture
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStorageEngineChoice("indexeddb");
                          setError("");
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          storageEngine === "indexeddb"
                            ? "bg-purple-600/10 border-purple-500/80 text-purple-200"
                            : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-zinc-200">IndexedDB</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">Standard browser storage</div>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 mt-2">Unencrypted</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStorageEngineChoice("sqlite");
                          setError("");
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          storageEngine === "sqlite"
                            ? "bg-purple-600/10 border-purple-500/80 text-purple-200"
                            : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-zinc-200">Encrypted SQLite</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">Hardware-bound AES-GCM</div>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400/90 mt-2">Encrypted</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-1">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Master Passphrase *
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Confirm Passphrase *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type passphrase"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#5B44C7] hover:bg-[#4a35ab] active:scale-[0.99] text-white font-medium text-xs py-3 rounded-xl transition mt-2 shadow-lg shadow-purple-900/20 cursor-pointer"
                  >
                    Continue to 2FA Setup →
                  </button>
                </form>
              )}

              {/* 3. ENROLLMENT (QR CODE) */}
              {mode === "enroll" && (
                <form className="flex flex-col gap-4" onSubmit={handleEnrollVerify}>
                  <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    {qrCodeDataUrl ? (
                      <div className="p-2 bg-[#ede7f6] rounded-lg shadow-md">
                        <img src={qrCodeDataUrl} alt="TOTP QR Code" className="w-36 h-36" />
                      </div>
                    ) : (
                      <div className="w-36 h-36 bg-zinc-800 rounded-lg animate-pulse" />
                    )}

                    <div className="mt-3 text-center">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                        Manual Entry Secret
                      </span>
                      <p className="font-mono text-xs text-purple-400 select-all tracking-wider mt-0.5">
                        {totpSecret || "Loading..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Verify Authenticator Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      required
                      autoFocus
                      value={totpToken}
                      onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full px-3.5 py-2.5 text-center font-mono tracking-widest text-base bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setError("");
                      }}
                      className="w-1/3 border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-medium text-xs py-3 rounded-xl transition cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-[#5B44C7] hover:bg-[#4a35ab] active:scale-[0.99] text-white font-medium text-xs py-3 rounded-xl transition shadow-lg shadow-purple-900/20 cursor-pointer"
                    >
                      Verify & Save
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}