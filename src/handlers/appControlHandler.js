/**
 * Handles open app and close app commands (with file/folder fallback for open).
 * @param {string} commandText 
 * @param {string} lower 
 * @returns {Promise<string|null>}
 */
export async function handleAppControlCommand(commandText, lower) {
  if (lower.startsWith("close ")) {
    const appName = commandText.slice(6).trim();
    const success = await window.assistant?.closeApp(appName);
    return success ? `"${appName}" has Closed` : `Could not find or close "${appName}".`;
  }
  
  if (lower.startsWith("open ")) {
    const appName = commandText.slice(5).trim();
    // Try launching as application first
    const appSuccess = await window.assistant?.openApp(appName);
    if (appSuccess) {
      return `"${appName}" Opened`;
    }
    // Fallback: search and open matching file or folder
    const searchResult = await window.assistant?.searchAndOpen(appName, "all");
    if (searchResult?.success) {
      return `Opened ${searchResult.isDirectory ? "folder" : "file"} "${searchResult.name}"`;
    }
    return `Could not find or open "${appName}".`;
  }

  return null;
}
