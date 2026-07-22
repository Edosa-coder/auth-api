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
            password: hashedPassword
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
    validateBody(["title", "content"]),
    async (req, res) => {
        const { title, content } = req.body;
        const notes = await readNotes();

        const newNote = {
            id: uuidv4(),
            userId: req.user.id,
            title,
            content
        };
        notes.push(newNote);
        await writeNotes(notes);
        return res.status(201).json({
            message: "Note created successfully.",
            note: newNote
        })
    }
)

export default router;