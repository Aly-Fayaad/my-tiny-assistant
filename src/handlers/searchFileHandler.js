/**
 * Handles search file, search folder, and find commands.
 * @param {string} commandText 
 * @param {string} lower 
 * @returns {Promise<string|null>}
 */
export async function handleSearchFileCommand(commandText, lower) {
  if (lower.startsWith("search file ") || lower.startsWith("find file ") || lower.startsWith("open file ")) {
    const target = commandText.replace(/^(search|find|open)\s+file\s+/i, "").trim();
    const result = await window.assistant?.searchAndOpen(target, "file");
    return result?.success ? `Opened file "${result.name}"` : `Could not find file "${target}".`;
  }
  
  if (lower.startsWith("search folder ") || lower.startsWith("find folder ") || lower.startsWith("open folder ")) {
    const target = commandText.replace(/^(search|find|open)\s+folder\s+/i, "").trim();
    const result = await window.assistant?.searchAndOpen(target, "folder");
    return result?.success ? `Opened folder "${result.name}"` : `Could not find folder "${target}".`;
  }
  
  if (lower.startsWith("search for ") || lower.startsWith("search ") || lower.startsWith("find ")) {
    const target = commandText.replace(/^(search\s+for|search|find)\s+/i, "").trim();
    const result = await window.assistant?.searchAndOpen(target, "all");
    return result?.success
      ? `Opened ${result.isDirectory ? "folder" : "file"} "${result.name}"`
      : `Could not find any file or folder matching "${target}".`;
  }

  return null;
}
