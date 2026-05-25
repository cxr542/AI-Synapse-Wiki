/**
 * Vite dev middleware: /api/admin/*
 */
import {
  deleteTopic,
  promoteInbox,
  runBuildEntries,
  updateTopic,
  writeTopic,
} from "./admin-api-handlers.mjs";
import { parseTopicSlugUrl } from "./admin-api-routes.mjs";
import { generateTopicNlDraft } from "./topic-nl-generate.mjs";
import {
  checkAdminRequest,
  checkDeleteAllowed,
  resolveProtectMode,
  setProtectModeSetting,
} from "./admin-env.mjs";

/** @param {import('http').IncomingMessage} req @param {Record<string, string>} env */
function requireAdmin(req, res, env) {
  const auth = checkAdminRequest(req, env);
  if (!auth.ok) {
    res.statusCode = auth.status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: auth.error }));
    return false;
  }
  return true;
}

/** @param {import('http').IncomingMessage} req */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

/** @param {Record<string, string>} env @returns {import('vite').PluginOption} */
export function adminApiPlugin(env = process.env) {
  return {
    name: "wiki-admin-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void (async () => {
          try {
            if (!req.url?.startsWith("/api/admin/")) {
              next();
              return;
            }

            if (
              req.url === "/api/admin/config" ||
              req.url === "/api/admin/topics/nl-config"
            ) {
              if (req.method === "GET") {
                const key = env.WIKI_TOPIC_LLM_API_KEY?.trim();
                const { protectMode, protectLocked, protectFromFile } =
                  resolveProtectMode(env);
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    ok: true,
                    llmConfigured: Boolean(key),
                    llmModel:
                      env.WIKI_TOPIC_LLM_MODEL?.trim() || "gemini-2.5-flash",
                    protectMode,
                    protectLocked,
                    protectFromFile,
                  }),
                );
                return;
              }
              if (req.url === "/api/admin/config" && req.method === "PATCH") {
                if (!requireAdmin(req, res, env)) return;
                const payload = await readJsonBody(req);
                if (typeof payload.protectMode !== "boolean") {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({
                      ok: false,
                      error: "protectMode (boolean) 가 필요합니다.",
                    }),
                  );
                  return;
                }
                const state = setProtectModeSetting(payload.protectMode, env);
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ ok: true, ...state }));
                return;
              }
            }

            const topicMatch = req.url ? parseTopicSlugUrl(req.url) : null;
            if (topicMatch && (req.method === "PUT" || req.method === "DELETE")) {
              if (!requireAdmin(req, res, env)) return;
              if (req.method === "DELETE") {
                const del = checkDeleteAllowed(env);
                if (!del.ok) {
                  res.statusCode = del.status;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: false, error: del.error }));
                  return;
                }
              }
              let result;
              if (req.method === "PUT") {
                const payload = await readJsonBody(req);
                result = updateTopic(topicMatch.slug, payload);
              } else {
                result = deleteTopic(topicMatch.slug);
              }
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, ...result }));
              return;
            }

            if (req.method !== "POST") {
              next();
              return;
            }

            if (!requireAdmin(req, res, env)) return;

            const payload = await readJsonBody(req);
            let result;

            if (req.url === "/api/admin/topics/nl-draft") {
              const draft = await generateTopicNlDraft(
                String(payload.request ?? ""),
                env,
              );
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, draft }));
              return;
            }
            if (req.url === "/api/admin/topics") {
              result = writeTopic(payload);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, ...result }));
              return;
            }
            if (req.url === "/api/admin/promote-inbox") {
              result = promoteInbox(payload);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, ...result }));
              return;
            }
            if (req.url === "/api/admin/rebuild") {
              const count = runBuildEntries();
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, count }));
              return;
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ ok: false, error: "unknown route" }));
          } catch (err) {
            if (!res.headersSent) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  ok: false,
                  error: err instanceof Error ? err.message : "error",
                }),
              );
            }
          }
        })();
      });
    },
  };
}
