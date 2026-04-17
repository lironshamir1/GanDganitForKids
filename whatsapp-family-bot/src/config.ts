import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const defaultDataDir = path.resolve(__dirname, '..', 'data');
const defaultAuthDir = path.resolve(__dirname, '..', '.wwebjs_auth');

export const config = {
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  model: process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free',
  familyGroupId: process.env.FAMILY_GROUP_ID ?? '',
  botPrefix: process.env.BOT_PREFIX ?? '!',
  timezone: process.env.TIMEZONE ?? 'Asia/Jerusalem',
  dataDir: process.env.DATA_DIR ?? defaultDataDir,
  wwebjsAuthDir: process.env.WWEBJS_AUTH_DIR ?? defaultAuthDir,
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
};

if (!config.openrouterApiKey) {
  throw new Error(
    'OPENROUTER_API_KEY is required. Copy .env.example to .env and set it (get a free key at https://openrouter.ai/keys).',
  );
}
