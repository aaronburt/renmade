import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const privilegesPath = path.join(__dirname, '../../data/privileges.json');

try {
    const data = fs.readFileSync(privilegesPath, 'utf8');
    const privileges = JSON.parse(data);
    if (config.OWNER_ID && !privileges.superUsers.includes(config.OWNER_ID)) {
        privileges.superUsers.push(config.OWNER_ID);
        fs.writeFileSync(privilegesPath, JSON.stringify(privileges, null, 4));
    }
} catch (error) {
    const defaultData = { superUsers: config.OWNER_ID ? [config.OWNER_ID] : [] };
    fs.mkdirSync(path.dirname(privilegesPath), { recursive: true });
    fs.writeFileSync(privilegesPath, JSON.stringify(defaultData, null, 4));
}

export function getPrivileges() {
    try {
        const data = fs.readFileSync(privilegesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { superUsers: [] };
    }
}

export function isSuperUser(userId) {
    if (userId === config.OWNER_ID) return true;
    const privileges = getPrivileges();
    return privileges.superUsers.includes(userId);
}

export function addSuperUser(userId) {
    const privileges = getPrivileges();
    if (!privileges.superUsers.includes(userId)) {
        privileges.superUsers.push(userId);
        fs.writeFileSync(privilegesPath, JSON.stringify(privileges, null, 4));
    }
}
