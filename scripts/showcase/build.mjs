// Builds the static showcase for GitHub Pages into ./out.
//
// GitHub Pages only serves files, so this build swaps out the parts that need
// a server (proxy, server actions, sign-in) for demo versions, then runs a
// static export. It changes files in place; on your own machine pass --restore
// to put the originals back afterwards (the GitHub Actions runner doesn't need it).
//
//   PAGES_BASE_PATH=/gtg-realstate node scripts/showcase/build.mjs --restore

import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const overrides = join(dirname(fileURLToPath(import.meta.url)), "overrides");
const backup = join(root, ".showcase-backup");
const restore = process.argv.includes("--restore");
const basePath = process.env.PAGES_BASE_PATH ?? "";

const removed = [
  "src/proxy.ts",
  "src/lib/supabase/proxy.ts",
  "src/app/[lang]/actions.ts",
  "src/app/crm/actions.ts",
  "src/app/crm/login",
  // The demo should not be indexed; a blocking robots.txt is written below.
  "src/app/robots.ts",
  "src/app/sitemap.ts",
];

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const stash = (rel) => {
  const from = join(root, rel);
  if (!existsSync(from)) return;
  const to = join(backup, rel);
  mkdirSync(dirname(to), { recursive: true });
  renameSync(from, to);
};

const putBack = () => {
  if (!existsSync(backup)) return;
  for (const file of walk(backup)) {
    const rel = relative(backup, file);
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    renameSync(file, join(root, rel));
  }
  rmSync(backup, { recursive: true, force: true });
};

try {
  rmSync(backup, { recursive: true, force: true });
  for (const rel of removed) stash(rel);
  for (const file of walk(overrides)) {
    const rel = relative(overrides, file);
    stash(rel);
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    cpSync(file, join(root, rel));
  }

  execSync("npx next build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, SHOWCASE: "1", PAGES_BASE_PATH: basePath, NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" },
  });

  const out = join(root, "out");
  // Without this, GitHub Pages hides the _next folder.
  writeFileSync(join(out, ".nojekyll"), "");
  writeFileSync(join(out, "robots.txt"), "User-agent: *\nDisallow: /\n");
  // The site root sends visitors to English.
  writeFileSync(
    join(out, "index.html"),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>GTG Real Estate</title>
<meta http-equiv="refresh" content="0; url=${basePath}/en/">
<link rel="canonical" href="${basePath}/en/"></head>
<body style="background:#120E10;color:#F3EFE7;font-family:sans-serif">
<a href="${basePath}/en/" style="color:#C9A46A">GTG Real Estate</a></body></html>\n`,
  );
  console.log(`\nShowcase ready in ./out (base path "${basePath || "/"}")`);
} finally {
  if (restore) {
    // Drop the copied-in overrides, then move the originals back.
    for (const file of walk(overrides)) rmSync(join(root, relative(overrides, file)), { force: true });
    putBack();
  }
}
