import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  familyGroupId: process.env.FAMILY_GROUP_ID ?? '',
  botPrefix: process.env.BOT_PREFIX ?? '!',
  timezone: process.env.TIMEZONE ?? 'Asia/Jerusalem',
  model: 'claude-opus-4-7',
  dataDir: path.resolve(__dirname, '..', 'data'),
};

if (!config.anthropicApiKey) {
  throw new Error('ANTHROPIC_API_KEY is required. Copy .env.example to .env and set it.');
}
