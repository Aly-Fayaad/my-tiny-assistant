import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import electron from "electron";
import { scoreMatch } from "./openApp.js";

const shell = electron?.shell || electron;

const IGNORED_NAMES = new Set([
  "$recycle.bin",
  "system volume information",
  "node_modules",
  ".git",
  ".vs",
  ".vscode",
  "appdata",
  "dist",
  "build",
  "windows",
  "program files",
  "program files (x86)",
  "programdata",
  "$windows.~bt",
  "$windows.~ws",
  ".cache",
  "temp",
  "vendor",
]);

/**
 * Discovers all mounted drive letters on Windows (e.g. ['C:\\', 'D:\\']).
 */
function getAvailableDrives() {
  const drives = [];
  for (let i = 65; i <= 90; i++) {
    const drive = String.fromCharCode(i) + ":\\";
    try {
      if (fs.existsSync(drive)) {
        drives.push(drive);
      }
    } catch {}
  }
  return drives;
}

/**
 * Scans standard user directories and all drive partitions (e.g. D:\, E:\).
 */
function searchDrivesAndUserDirs(query, maxDepth = 4) {
  const q = query.toLowerCase().trim();
  const userHome = os.homedir();
  
  const searchRoots = [
    path.join(userHome, "Desktop"),
    path.join(userHome, "Downloads"),
    path.join(userHome, "Documents"),
    path.join(userHome, "Pictures"),
    path.join(userHome, "Videos"),
    path.join(userHome, "Music"),
    userHome,
  ];

  // Add all non-C drive roots (e.g. D:\, E:\)
  const drives = getAvailableDrives();
  for (const drive of drives) {
    if (drive.toLowerCase() !== "c:\\") {
      searchRoots.push(drive);
    }
  }

  const results = [];
  const visited = new Set();

  function scan(dir, depth) {
    if (depth > maxDepth) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const lowerName = entry.name.toLowerCase();
        if (IGNORED_NAMES.has(lowerName) || lowerName.startsWith(".")) {
          continue;
        }

        const fullPath = path.join(dir, entry.name);
        const pathKey = fullPath.toLowerCase();
        if (visited.has(pathKey)) continue;
        visited.add(pathKey);

        if (lowerName.includes(q)) {
          results.push({ name: entry.name, path: fullPath, isDirectory: entry.isDirectory() });
        }

        if (entry.isDirectory() && depth < maxDepth) {
          scan(fullPath, depth + 1);
        }
      }
    } catch {
      // Ignore inaccessible directories
    }
  }

  for (const root of searchRoots) {
    if (fs.existsSync(root)) {
      const baseName = path.basename(root) || root;
      if (baseName.toLowerCase().includes(q)) {
        results.push({ name: baseName, path: root, isDirectory: true });
      }
      scan(root, 1);
    }
  }

  return results;
}

/**
 * Searches for a file or folder across all drive partitions and opens it in Windows.
 * @param {string} query The search string (e.g. "farmer", "Cyber Security", "movies", "Fast Api")
 * @param {'file' | 'folder' | 'all'} typeFilter Filter by file, folder, or both
 * @returns {Promise<{ success: boolean, name?: string, path?: string, isDirectory?: boolean, error?: string }>}
 */
export default async function searchAndOpenFile(query, typeFilter = "all") {
  if (!query || !query.trim()) {
    return { success: false, error: "Search query is empty." };
  }

  const cleanQuery = query.trim();

  // Fast direct scan across all drive partitions (C:\, D:\, etc.)
  const candidates = searchDrivesAndUserDirs(cleanQuery);

  // Deduplicate candidates by path
  const seenPaths = new Set();
  const uniqueCandidates = [];
  for (const c of candidates) {
    if (c.path && !seenPaths.has(c.path.toLowerCase())) {
      seenPaths.add(c.path.toLowerCase());
      uniqueCandidates.push(c);
    }
  }

  if (uniqueCandidates.length === 0) {
    return { success: false, error: `No matching file or folder found for "${cleanQuery}".` };
  }

  // Score & filter
  let best = null;
  let bestScore = -1;
  const userHomeLower = os.homedir().toLowerCase();

  for (const item of uniqueCandidates) {
    try {
      if (!fs.existsSync(item.path)) continue;
      const stats = fs.statSync(item.path);
      const isDirectory = stats.isDirectory();

      if (typeFilter === "file" && isDirectory) continue;
      if (typeFilter === "folder" && !isDirectory) continue;

      let score = scoreMatch(cleanQuery, item.name || path.basename(item.path));
      const lowerPath = item.path.toLowerCase();

      // Boost items in user home directory OR user drive partitions (D:\, E:\, etc.)
      if (lowerPath.startsWith(userHomeLower) || (!lowerPath.startsWith("c:\\") && !lowerPath.startsWith("c:/"))) {
        score += 150;
      }

      // Boost items in non-hidden / non-system directories
      if (!lowerPath.includes("\\appdata\\") && !lowerPath.includes("\\node_modules\\")) {
        score += 50;
      }

      // Penalize Default or system user paths
      if (lowerPath.includes("\\users\\default") || lowerPath.includes("\\users\\public")) {
        score -= 100;
      }

      if (score > bestScore) {
        bestScore = score;
        best = { ...item, isDirectory };
      }
    } catch {
      // Ignore file stat errors
    }
  }

  if (!best || bestScore < 0) {
    return { success: false, error: `No accessible file or folder matched "${cleanQuery}".` };
  }

  // Open the file or folder
  try {
    if (shell && typeof shell.openPath === "function") {
      const openError = await shell.openPath(best.path);
      if (openError) {
        // Fallback to explorer.exe if shell.openPath returns an error string
        spawn("explorer.exe", [best.path], { stdio: "ignore", detached: true }).unref();
      }
    } else {
      spawn("explorer.exe", [best.path], { stdio: "ignore", detached: true }).unref();
    }

    return {
      success: true,
      name: best.name || path.basename(best.path),
      path: best.path,
      isDirectory: best.isDirectory,
    };
  } catch (err) {
    console.error(`Failed to open path "${best.path}":`, err);
    return { success: false, error: err.message };
  }
}
