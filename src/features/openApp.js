import { execSync, spawn } from "child_process";

/**
 * Gets all apps known to Windows (Start Menu index) — covers both
 * classic desktop apps AND UWP/Microsoft Store apps.
 * Returns [{ name, appId }]
 */
function getInstalledApps() {
  const ps = `Get-StartApps | ConvertTo-Json -Compress`;
  const stdout = execSync(`powershell -NoProfile -Command "${ps}"`, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "ignore"],
  }).trim();
  
  let apps = JSON.parse(stdout);
  if (!Array.isArray(apps)) apps = [apps];
  return apps.map((a) => ({ name: a.Name, appId: a.AppID }));
}

/**
 * Scores how well `query` matches `name`, similar to how Windows Search ranks results:
 * exact > starts-with > contains > in-order subsequence ("fuzzy")
 */
export function scoreMatch(query, name) {
  const q = query.toLowerCase().trim();
  const n = name.toLowerCase();

  if (n === q) return 1000;
  if (n.startsWith(q)) return 900 - (n.length - q.length);
  if (n.includes(q)) return 700 - (n.length - q.length);

  // Subsequence match: every char of q appears in order in n (e.g. "vscd" -> "Visual Studio Code")
  let qi = 0;
  let lastIndex = -1;
  let gapPenalty = 0;
  for (let ni = 0; ni < n.length && qi < q.length; ni++) {
    if (n[ni] === q[qi]) {
      if (lastIndex !== -1) gapPenalty += ni - lastIndex - 1;
      lastIndex = ni;
      qi++;
    }
  }
  if (qi === q.length) return 400 - gapPenalty;

  return -1; // no match at all
}

function findBestApp(query, apps) {
  let best = null;
  let bestScore = -1;
  for (const app of apps) {
    const score = scoreMatch(query, app.name);
    if (score > bestScore) {
      bestScore = score;
      best = app;
    }
  }
  return bestScore >= 0 ? best : null;
}

/**
 * Launches an app by fuzzy name using the Start Menu index.
 * Handles both UWP apps (AppID contains "!") and classic apps
 * (AppID is a path to a .lnk or .exe).
 */
export default function launchApp(query) {
  const apps = getInstalledApps();
  const match = findBestApp(query, apps);
  if (!match) {
    console.error(`No app found matching "${query}".`);
    return false;
  }

  spawn("explorer.exe", [`shell:AppsFolder\\${match.appId}`], {
    stdio: "ignore",
    detached: true,
  }).unref();

  console.log(`Launched "${match.name}"`);
  return true;
}

 