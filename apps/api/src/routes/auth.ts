import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../services/db";
import { signToken } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";

export const authRouter = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
    });
    if (existing) throw createError("Email or username already taken", 409);

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: { username: body.username, email: body.email, passwordHash },
      select: { id: true, username: true, email: true },
    });
    const token = signToken(user.id);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw createError("Invalid credentials", 401);

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) throw createError("Invalid credentials", 401);

    const token = signToken(user.id);
    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (err) {
    next(err);
  }
});
