// cross-runtime getFullImportPath.ts

// Runtime detection
// @ts-ignore
const isDeno = typeof Deno !== "undefined" && "cwd" in Deno;
// @ts-ignore
const isBun = typeof Bun !== "undefined";
// @ts-ignore
const isNode = !isDeno && !isBun;

let join: (a: string, b: string) => string;
let cwd: () => string;
let fromFileUrl: (url: string) => string;

// --- Runtime-specific shims ---
if (isDeno) {
  // @ts-ignore
  // const path = await import("https://deno.land/std@0.203.0/path/mod.ts");

  const path = await import("node:path");
  join = path.join;
  const url = await import("node:url");
  // @ts-ignore
  cwd = Deno.cwd;
  fromFileUrl = url.fileURLToPath;
  //  fromFileUrl = path.fromFileUrl;
} else if (isNode) {
  const path = await import("node:path");
  const processMod = await import("node:process");
  const url = await import("node:url");
  join = path.join;
  cwd = processMod.cwd;
  fromFileUrl = url.fileURLToPath;
} else if (isBun) {
  const path = await import("path");
  join = path.join;
  cwd = () => process.cwd();
  fromFileUrl = (u: string) => new URL(u).pathname; // Bun auto normalizes
}

// --- Universal function ---
export async function getFullImportPath(
  importPathOrName: string,
): Promise<string> {
  let importPath: string;

  if (importPathOrName.startsWith(".")) {
    importPath = join(cwd(), importPathOrName);
  } else {
    importPath = importPathOrName;
  }

  if (importPathOrName === importPath) {
    // Turn into a full absolute path
    const fullUrl = new URL(importPath, import.meta.url).href;
    return fromFileUrl(fullUrl);
  }

  return importPath;
}
