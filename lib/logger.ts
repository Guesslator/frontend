import fs from 'fs';
import path from 'path';

export function logParams(params: any) {
    const logPath = path.join(process.cwd(), 'debug_params.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Params: ${JSON.stringify(params)}\n`;
    fs.appendFileSync(logPath, logEntry);
}
