import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const defaultDataDir = path.resolve(__dirname, '..', 'data');
const defaultAuthDir = path.resolve(__dirname, '..', '.wwebjs_auth');

export const config = {
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  familyGroupId: process.env.FAMILY_GROUP_ID ?? '',
  botPrefix: process.env.BOT_PREFIX ?? '!',
  timezone: process.env.TIMEZONE ?? 'Asia/Jerusalem',
  dataDir: process.env.DATA_DIR ?? defaultDataDir,
  wwebjsAuthDir: process.env.WWEBJS_AUTH_DIR ?? defaultAuthDir,
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
};

if (!config.groqApiKey) {
  throw new Error(
    'GROQ_API_KEY is required. Get a free key at https://console.groq.com/keys and set it in .env.',
  );
}
