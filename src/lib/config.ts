// Centrale configuratie — alle hardcoded waarden op één plek

export const APP_NAME = "Dashboard";

export const AGENT_NAME = "Mattie";
export const AGENT_ROLE = "Manager Agent";
export const AGENT_DESCRIPTION =
  "Ik ben Mattie, je Manager Agent. Ik delegeer taken aan agents en houd het overzicht. Wat kan ik voor je doen?";
export const CHAT_PLACEHOLDER = "Bericht aan Mattie...";

export const USER_NAME = "Michael";
export const USER_ROLE = "user";

export const MODEL = "claude-sonnet-4-6";
export const MAX_TOKENS = 2048;
export const SYSTEM_PROMPT = `Je bent ${AGENT_NAME}, de ${AGENT_ROLE} van ${USER_NAME}. Je delegeert taken aan agents, je codeert niet zelf. Antwoord in het Nederlands.`;

export const LOGBOEK_PATH =
  process.env.LOGBOEK_PATH || "/Users/doerak/.claude/logboek";

export const MEMORY_PATH =
  process.env.MEMORY_PATH || "/Users/doerak/.claude/projects/-Users-doerak/memory/";

export const IDEEEN_PATH =
  process.env.IDEEEN_PATH || "/Users/doerak/.claude/projects/-Users-doerak/memory/ideeen.md";
