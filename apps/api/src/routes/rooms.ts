import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../services/db";
import { createError } from "../middleware/errorHandler";

export const roomsRouter = Router();

const createRoomSchema = z.object({
  name: z.string().min(1).max(80),
  mode: z.enum(["FREE_PRACTICE", "SAME_PROBLEM", "HEAD_TO_HEAD"]).default("FREE_PRACTICE"),
  visibility: z.enum(["PRIVATE", "FRIENDS", "PUBLIC"]).default("FRIENDS"),
  problemId: z.string().optional(),
});

// POST /api/rooms
roomsRouter.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const body = createRoomSchema.parse(req.body);
    const userId = req.userId!;

    const room = await prisma.room.create({
      data: {
        ...body,
        hostId: userId,
        members: {
          create: { userId, isHost: true },
        },
      },
      include: { members: { include: { user: { select: { username: true, avatarUrl: true } } } } },
    });

    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
});

// GET /api/rooms — list public/friends rooms
roomsRouter.get("/", requireAuth, async (_req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { visibility: "PUBLIC" },
      include: {
        members: {
          include: { user: { select: { username: true, avatarUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(rooms);
  } catch (err) {
    next(err);
  }
});

// GET /api/rooms/:id
roomsRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { user: { select: { username: true, avatarUrl: true } } } },
      },
    });
    if (!room) throw createError("Room not found", 404);
    res.json(room);
  } catch (err) {
    next(err);
  }
});

// POST /api/rooms/:id/join
roomsRouter.post("/:id/join", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const room = await prisma.room.findUnique({ where: { id: req.params.id } });
    if (!room) throw createError("Room not found", 404);

    await prisma.roomMember.upsert({
      where: { roomId_userId: { roomId: room.id, userId } },
      create: { roomId: room.id, userId },
      update: { status: "IDLE" },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/rooms/:id/leave
roomsRouter.delete("/:id/leave", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.roomMember.deleteMany({
      where: { roomId: req.params.id, userId: req.userId! },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
