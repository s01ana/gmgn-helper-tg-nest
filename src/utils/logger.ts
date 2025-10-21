import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '..', 'logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create log file for current date
function getLogFilePath() {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logDir, `${date}.log`);
}

// Append text to the file
function writeLog(level: string, message: any[]) {
  const time = new Date().toISOString();
  const text = `[${time}] [${level}] ${message.join(' ')}\n`;
  fs.appendFileSync(getLogFilePath(), text);
}

// Override console methods
['log', 'info', 'warn', 'error'].forEach((method) => {
  const original = console[method as keyof Console] as any;
  console[method] = (...args: any[]) => {
    writeLog(method.toUpperCase(), args);
    original.apply(console, args);
  };
});
