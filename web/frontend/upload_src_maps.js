import * as fs from "node:fs";
import { resolve } from "node:path";

async function* getFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

const deleteSrcMaps = async () => {
  for await (const f of getFiles("dist/assets/")) {
    if (f.endsWith(".map") || f.endsWith(".map.br") || f.endsWith(".map.gz")) {
      console.log("Deleting map file", f);
      fs.unlinkSync(f);
    }
  }
};

const main = async () => {
  await uploadSrcMaps();
  await deleteSrcMaps();
};

if (process.env.npm_lifecycle_event === "upload") {
  main();
}
