import { readFile, writeFile} from 'fs/promises';

const NOTES_FILE = './notes.json';

export async function readNotes() {

    try {
        const data = await readFile (NOTES_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function writeNotes(notes) {
    try {
        await writeFile(
            NOTES_FILE,
            JSON.stringify(notes, null, 2),
            "UTF-8"
        );
    } catch (error) {
        console.error(error);
    }
}