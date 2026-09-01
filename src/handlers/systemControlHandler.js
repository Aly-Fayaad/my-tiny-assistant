/**
 * Handles volume, mute, and brightness commands.
 * @param {string} commandText 
 * @param {string} lower 
 * @returns {Promise<string|null>}
 */
export async function handleSystemControlCommand(commandText, lower) {
  if (lower === "volume up" || lower === "increase volume" || lower === "louder") {
    const result = await window.assistant?.systemControl("volume_up");
    return result?.message || "Volume increased";
  }
  
  if (lower === "volume down" || lower === "decrease volume" || lower === "lower volume" || lower === "quieter") {
    const result = await window.assistant?.systemControl("volume_down");
    return result?.message || "Volume decreased";
  }
  
  if (lower === "mute" || lower === "mute volume" || lower === "mute audio") {
    const result = await window.assistant?.systemControl("mute");
    return result?.message || "Volume muted";
  }
  
  if (lower === "unmute" || lower === "unmute volume" || lower === "unmute audio") {
    const result = await window.assistant?.systemControl("unmute");
    return result?.message || "Volume unmuted";
  }
  
  if (lower === "brightness up" || lower === "increase brightness") {
    const result = await window.assistant?.systemControl("brightness_up");
    return result?.message || "Brightness increased";
  }
  
  if (lower === "brightness down" || lower === "decrease brightness") {
    const result = await window.assistant?.systemControl("brightness_down");
    return result?.message || "Brightness decreased";
  }
  
  if (lower.startsWith("set brightness to ") || lower.startsWith("brightness ")) {
    const match = lower.match(/\d+/);
    const val = match ? parseInt(match[0], 10) : 50;
    const result = await window.assistant?.systemControl("set_brightness", val);
    return result?.message || `Brightness set to ${val}%`;
  }

  return null;
}
