import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const config = {
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  model: process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free',
  familyGroupId: process.env.FAMILY_GROUP_ID ?? '',
  botPrefix: process.env.BOT_PREFIX ?? '!',
  timezone: process.env.TIMEZONE ?? 'Asia/Jerusalem',
  dataDir: path.resolve(__dirname, '..', 'data'),
};

if (!config.openrouterApiKey) {
  throw new Error(
    'OPENROUTER_API_KEY is required. Copy .env.example to .env and set it (get a free key at https://openrouter.ai/keys).',
  );
}
