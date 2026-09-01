import { handleSystemControlCommand } from "./systemControlHandler.js";
import { handleSearchFileCommand } from "./searchFileHandler.js";
import { handleAppControlCommand } from "./appControlHandler.js";

/**
 * Routes user commands to the appropriate feature handler.
 * @param {string} rawCommandText 
 * @returns {Promise<string>}
 */
export async function routeCommand(rawCommandText) {
  if (!rawCommandText || !rawCommandText.trim()) return "";

  const commandText = rawCommandText.trim().replace(/[.?!]+$/, "");
  const lower = commandText.toLowerCase();

  // 1. Check System Controls (Volume, Mute, Brightness)
  let response = await handleSystemControlCommand(commandText, lower);
  if (response) return response;

  // 2. Check File & Folder Search Commands
  response = await handleSearchFileCommand(commandText, lower);
  if (response) return response;

  // 3. Check App Launch / Close Commands
  response = await handleAppControlCommand(commandText, lower);
  if (response) return response;

  // Default fallback response
  return `Unknown command. Try "volume up", "brightness up", "open <app>", or "search folder <name>".`;
}
