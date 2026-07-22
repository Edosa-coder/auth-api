import { readFile, writeFile } from 'fs/promises';

const USERS_FILE = './users.json';

export async function readUsers() {
    try {
        const data = await readFile(USERS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
        return [];
    }

    }

export async function writeUsers(users) {
    try { 
        await writeFile(
            USERS_FILE,
            JSON.stringify(users, null, 2),
            "utf-8"
        );
    } catch (error) {
        console.error(error);
    }
} 