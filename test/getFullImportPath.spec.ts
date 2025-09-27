import test from "node:test";
import { getFullImportPath } from "../dist/utils/getFullImportPath.js";
import assert from "node:assert";
import path from "node:path";

test("Should get full path with relative path", async () => {
  const fullPath = await getFullImportPath("../");
  assert(path.isAbsolute(fullPath));
});

test("Should get full path from packageName", async () => {
  const fullPath = await getFullImportPath(
    "@swizzyweb/swap-cache-db-web-service",
  );
  assert(path.isAbsolute(fullPath));
});
