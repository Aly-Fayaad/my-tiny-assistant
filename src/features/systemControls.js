import { execSync } from "child_process";

/**
 * Changes Windows master volume using WScript.Shell virtual key sendkeys.
 * @param {'up' | 'down' | 'mute' | 'unmute'} action
 */
export function changeVolume(action) {
  let psCommand = "";
  if (action === "up") {
    // Send VK_VOLUME_UP (175) 5 times (~10% increase)
    psCommand = `$w = New-Object -ComObject WScript.Shell; 1..5 | ForEach-Object { $w.SendKeys([char]175) }`;
  } else if (action === "down") {
    // Send VK_VOLUME_DOWN (174) 5 times (~10% decrease)
    psCommand = `$w = New-Object -ComObject WScript.Shell; 1..5 | ForEach-Object { $w.SendKeys([char]174) }`;
  } else if (action === "mute" || action === "unmute") {
    // Send VK_VOLUME_MUTE (173)
    psCommand = `$w = New-Object -ComObject WScript.Shell; $w.SendKeys([char]173)`;
  }

  try {
    const encoded = Buffer.from(psCommand, "utf16le").toString("base64");
    execSync(`powershell -NoProfile -EncodedCommand ${encoded}`, { stdio: "ignore" });
    return true;
  } catch (err) {
    console.error("Volume control error:", err);
    return false;
  }
}

/**
 * Gets current monitor brightness percentage (0 - 100).
 */
export function getBrightness() {
  try {
    const stdout = execSync(
      `powershell -NoProfile -Command "(Get-WmiObject -Namespace root/wmi -Class WmiMonitorBrightness).CurrentBrightness"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], timeout: 3000 }
    ).trim();
    const val = parseInt(stdout, 10);
    return isNaN(val) ? 50 : val;
  } catch {
    return 50;
  }
}

/**
 * Sets monitor brightness to target percentage (0 - 100).
 */
export function setBrightness(targetLevel) {
  const level = Math.max(0, Math.min(100, Math.round(targetLevel)));
  try {
    execSync(
      `powershell -NoProfile -Command "(Get-WmiObject -Namespace root/wmi -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, ${level})"`,
      { stdio: "ignore", timeout: 3000 }
    );
    return { success: true, level };
  } catch (err) {
    console.error("Brightness control error:", err);
    return { success: false, level };
  }
}

/**
 * Increases or decreases brightness by amount.
 */
export function changeBrightness(action, amount = 10) {
  const current = getBrightness();
  let target = current;
  if (action === "up") {
    target = Math.min(100, current + amount);
  } else if (action === "down") {
    target = Math.max(0, current - amount);
  }
  return setBrightness(target);
}

/**
 * Central handler for volume & brightness commands.
 */
export default async function handleSystemControl(action, value = null) {
  switch (action) {
    case "volume_up": {
      const ok = changeVolume("up");
      return { success: ok, message: ok ? "Volume increased" : "Failed to change volume" };
    }
    case "volume_down": {
      const ok = changeVolume("down");
      return { success: ok, message: ok ? "Volume decreased" : "Failed to change volume" };
    }
    case "mute": {
      const ok = changeVolume("mute");
      return { success: ok, message: ok ? "Volume muted" : "Failed to mute volume" };
    }
    case "unmute": {
      const ok = changeVolume("unmute");
      return { success: ok, message: ok ? "Volume unmuted" : "Failed to unmute volume" };
    }
    case "brightness_up": {
      const res = changeBrightness("up", value || 10);
      return { success: res.success, message: res.success ? `Brightness increased to ${res.level}%` : "Failed to adjust brightness" };
    }
    case "brightness_down": {
      const res = changeBrightness("down", value || 10);
      return { success: res.success, message: res.success ? `Brightness decreased to ${res.level}%` : "Failed to adjust brightness" };
    }
    case "set_brightness": {
      const target = value !== null ? value : 50;
      const res = setBrightness(target);
      return { success: res.success, message: res.success ? `Brightness set to ${res.level}%` : "Failed to set brightness" };
    }
    default:
      return { success: false, message: "Unknown system control action" };
  }
}
