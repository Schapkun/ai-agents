import { promises as fs } from "fs";
import path from "path";

const USAGE_FILE = path.join(
  process.cwd(),
  "usage-data.json"
);

export type UsageEntry = {
  datum: string; // YYYY-MM-DD
  model: string;
  input_tokens: number;
  output_tokens: number;
  requests: number;
};

export type UsageData = {
  entries: UsageEntry[];
};

async function leesData(): Promise<UsageData> {
  try {
    const raw = await fs.readFile(USAGE_FILE, "utf-8");
    return JSON.parse(raw) as UsageData;
  } catch {
    return { entries: [] };
  }
}

async function schrijfData(data: UsageData): Promise<void> {
  await fs.writeFile(USAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function registreerGebruik(
  model: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const data = await leesData();
  const vandaag = new Date().toISOString().slice(0, 10);

  const bestaand = data.entries.find(
    (e) => e.datum === vandaag && e.model === model
  );

  if (bestaand) {
    bestaand.input_tokens += inputTokens;
    bestaand.output_tokens += outputTokens;
    bestaand.requests += 1;
  } else {
    data.entries.push({
      datum: vandaag,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      requests: 1,
    });
  }

  await schrijfData(data);
}

export async function haalUsageOp(): Promise<UsageData> {
  return leesData();
}
