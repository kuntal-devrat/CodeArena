import "dotenv/config";
import express from "express";
import { runHandler } from "./runHandler";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// POST /run — called by the API service
app.post("/run", runHandler);

const PORT = process.env.JUDGE_PORT ?? 5000;
app.listen(PORT, () => {
  console.log(`[judge] listening on http://localhost:${PORT}`);
});
