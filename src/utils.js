const fs = require("fs"); // For interacting with the file system
const path = require("path"); // For working with file and directory paths

const cache = {};

export const loadSQL = (filePath) => {
    const fullPath = path.resolve(filePath);

    if (!cache[fullPath]) {
        cache[fullPath] = fs.readFileSync(fullPath, "utf8");
    }

    return cache[fullPath];
};