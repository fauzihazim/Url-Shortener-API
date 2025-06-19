import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const rfsModule = await import('rotating-file-stream');
const rfs = rfsModule.default || rfsModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDirectory = path.join(__dirname, '../log');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
};

export const accessLogStream = rfs.createStream('access.log', {
  size: '10M',
  interval: '1d',
  compress: 'gzip',
  path: logDirectory
});