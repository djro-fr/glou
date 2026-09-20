import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';

const fileURL = new URL("../../.env", import.meta.url);
config({ path: fileURLToPath(fileURL) });