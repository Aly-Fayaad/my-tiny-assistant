import { execSync } from "child_process";
import { scoreMatch } from "./openApp.js";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Gets all running processes that have a visible window (i.e. actual apps,
 * not background services). Returns [{ pid, name, title }]
 */
function getRunningApps() {
  const script = `Get-Process | Where-Object { $_.MainWindowTitle -ne '' } | Select-Object Id, ProcessName, MainWindowTitle | ConvertTo-Json -Compress`;
  const tmpFile = join(tmpdir(), `ga_${Date.now()}.ps1`);
  writeFileSync(tmpFile, script, "utf8");
  try {
    const stdout = execSync(`powershell -NoProfile -File "${tmpFile}"`, {
      encoding: "utf8",
    }).trim();
    let procs = JSON.parse(stdout);
    if (!Array.isArray(procs)) procs = [procs];
    return procs.map((p) => ({
      pid: p.Id,
      name: p.ProcessName,
      title: p.MainWindowTitle,
    }));
  } finally {
    unlinkSync(tmpFile);
  }
}

/**
 * Finds the best matching running process for a query, checking both
 * the process name (e.g. "chrome") and window title (e.g. "Inbox - Gmail")
 * and taking whichever scores higher.
 */
function findBestProcess(query, procs) {
  let best = null;
  let bestScore = -1;

  for (const proc of procs) {
    const nameScore = scoreMatch(query, proc.name);
    const titleScore = scoreMatch(query, proc.title);
    const score = Math.max(nameScore, titleScore);

    if (score > bestScore) {
      bestScore = score;
      best = proc;
    }
  }

  return bestScore >= 0 ? best : null;
}

/**
 * Closes an app by fuzzy name/title match against running processes.
 * Always force-kills — no graceful-close attempt.
 * @param {string} query - name to search for
 */
export default function closeApp(query) {
  const procs = getRunningApps();
  const match = findBestProcess(query, procs);

  if (!match) {
    console.error(`No running app found matching "${query}".`);
    return false;
  }

  try {
    execSync(`taskkill /PID ${match.pid} /F`, { stdio: "ignore" });
    console.log(`Closed "${match.title || match.name}" (PID ${match.pid})`);
    return true;
  } catch (err) {
    console.error(`Failed to close "${match.name}": ${err.message}`);
    return false;
  }
}

// ESM equivalent of `require.main === module`
// if (process.argv[1] === fileURLToPath(import.meta.url)) {
//   const query = process.argv[2] || "Postman";
// }
