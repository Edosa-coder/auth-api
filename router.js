import {Router} from 'express';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";


import { readUsers, writeUsers } from "./userStore.js";
import { readNotes, writeNotes } from "./noteStore.js";
import { validateBody } from "./validateBody.js";
import { authMiddleware } from "./authMiddleware.js";
import {v4 as uuidv4} from "uuid";


const router = Router();
router.post(
    "/register",
    validateBody(["username", "password"]),
    async (req, res) => {

        const { username, password } = req.body;

        const users = await readUsers();

        const existingUser = users.find(
            (user) => user.username.toLowerCase() === username.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({
                error: "Username already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: uuidv4(),
            username,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        await writeUsers(users);

        return res.status(201).json({
            message: "User registered successfully."
        });

    }
);

router.post(
    "/login",
    validateBody(["username", "password"]),
    async (req, res) => {
        const { username, password } = req.body;

        const users = await readUsers();
        const user = users.find(
            (user) => user.username.toLowerCase() === username.toLowerCase()
        )
        if (!user) {
            return res.status(401).json({
                error: "Invalid username or password."
            });
        } const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid username or password."
            });
        } const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        return res.status(200).json({
            message: "Login successful.",
            token
        });
    }
       
)
router.get(
    "/profile",
    authMiddleware,
    (req, res) => {

        return res.status(200).json({
            user: req.user
        })
    }
)

router.post(
    "/notes",
    authMiddleware,
    validateBody(["title", "content", "tag"]),
    async (req, res) => {
        const { title, content, tag } = req.body;
        const notes = await readNotes();

        const newNote = {
            id: uuidv4(),
            userId: req.user.id,
            title,
            content,
            tag,
            createdAt: new Date().toISOString()
        };
        notes.push(newNote);
        await writeNotes(notes);
        return res.status(201).json({
            message: "Note created successfully.",
            note: newNote
        })
    }
)
router.get(
    "/notes",
    authMiddleware,
    async(req, res) => {
        const notes = await readNotes();
        const userNotes = notes.filter(
            (note) => note.userId === req.user.id
        );
        return res.status(200).json({
            notes: userNotes
        })
    }

)

router.get (
    "/notes/:id",
    authMiddleware,
    async (req, res) => {
        const { id } = req.params;
        const notes = await readNotes();
        const note = notes.find(
            (note) => note.id === id && note.userId === req.user.id
        )
        if (!note) {
            return res.status(404).json({
                error: "Note not found."
            })
        }
        return res.status(200).json({
            note
        })
    }
)
router.put(
    "/notes/:id",
    authMiddleware,
    validateBody(["title", "content", "tag"]),
    async (req, res) => {
        const { id } = req.params;
        const { title, content, tag } = req.body;
        const notes = await readNotes();
        const noteIndex = notes.findIndex(
            (note) => note.id === id && note.userId === req.user.id
        )
        if (noteIndex === -1) {
            return res.status(404).json({
                error: "Note not found."
            })
        }
        notes[noteIndex].title = title;
        notes[noteIndex].content = content;
        notes[noteIndex].tag = tag;
        notes[noteIndex].updatedAt = new Date().toISOString();
        await writeNotes(notes);
        return res.status(200).json({
            message: "Note updated successfully.",
            note: notes[noteIndex]
        });
    }
    
    
)
router.delete(
    "/notes/:id",
    authMiddleware,
    async (req, res) => {
        const { id } = req.params;
        const notes = await readNotes();
        const noteIndex = notes.findIndex(
            (note) => note.id === id && note.userId === req.user.id
        );
        if (noteIndex === -1) {
            return res.status(404).json({
                error: "Note not found."
            });
        }
        notes.splice(noteIndex, 1);
        await writeNotes(notes);
        return res.status(200).json({
            message: "Note deleted successfully."
        });
    }
);

router.post(
    "/logout",
    authMiddleware,
    (req, res) => {
        return res.status(200).json({
            message: "Logout Successful."
        })
    }
)
export default router;