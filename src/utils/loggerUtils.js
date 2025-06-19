// // import rfs from 'rotating-file-stream';
// import fs from 'fs';
// // import rfs from 'rotating-file-stream';
// import { fileURLToPath } from 'url';
// // import 'rotating-file-stream';
// const rfsModule = await import('rotating-file-stream');
// const rfs = rfsModule.default || rfsModule;
// import path from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const logDirectory = path.join(__dirname, '../log');
// fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory, { recursive: true });

// const accessLogStream  = rfs.createStream("file.log", {
//   size: "10M", // rotate every 10 MegaBytes written
//   interval: "1d", // rotate daily
//   path: logDirectory
// });

// // module.exports = accessLogStream;
// export default { accessLogStream };

// src/utils/logger.js
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Dynamic import for CommonJS package
const rfsModule = await import('rotating-file-stream');
const rfs = rfsModule.default || rfsModule;

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create log directory if not exists
const logDirectory = path.join(__dirname, '../log');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Create rotating stream
export const accessLogStream = rfs.createStream('access.log', {
  size: '10M',
  interval: '1d',
  compress: 'gzip',
  path: logDirectory
});