import "dotenv/config";
import http from "http";
import { app } from "./app";
import { initSocketServer } from "./ws/socketServer";

const PORT = process.env.API_PORT ?? 4000;

const server = http.createServer(app);
initSocketServer(server);

server.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
