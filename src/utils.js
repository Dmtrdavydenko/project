import fs from "fs";
import path from "path";

const cache = {};

export const loadSQL = (filePath) => {
    const fullPath = path.resolve(filePath);

    if (!cache[fullPath]) {
        cache[fullPath] = fs.readFileSync(fullPath, "utf8");
    }

    return cache[fullPath];
};