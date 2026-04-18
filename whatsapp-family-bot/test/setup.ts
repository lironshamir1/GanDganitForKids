import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wabot-test-'));
process.env.DATA_DIR = tmpDir;
process.env.WWEBJS_AUTH_DIR = path.join(tmpDir, 'auth');
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY ?? 'test-key';
