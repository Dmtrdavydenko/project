import { profileController } from "../controllers/profile.controller.js";
import { fabricRecipeController } from "../controllers/fabricRecipe.controller.js";
import { weavingLogsController } from "../controllers/weavingLogs.controller.js";

const routes = {
    "/api/profile": profileController,
    "/api/fabric_recipe/select": fabricRecipeController,
    "/api/weaving_logs/select": weavingLogsController,
};

export async function handleApi(req, res, pathname) {

    const handler = routes[pathname];

    if (!handler) {
        res.writeHead(404, {
            "Content-Type": "application/json"
        });

        return res.end(JSON.stringify({
            error: "API not found"
        }));
    }

    return handler(req, res);
}