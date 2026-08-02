import { loadSQL } from "../utils.js";
import { getAwaitConnect } from "../database/connection.js";
export async function profileController(req, res) {

    const user = await getUserBySession(req);
    if (!user) {
        res.writeHead(401, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            success: false,
            redirect: "/authentication"
        }));
        return;
    }
    const connection = await getAwaitConnect();

    try {
        const sqlReg = loadSQL("./src/sql/user_profile/select.sql");
        const [userRows] = await connection.execute(sqlReg, [user.user_id]);
        if (userRows.length > 0) {
            user.profile = userRows[0];
        } else {
            user.profile = null;
        }
        const sqlPerm = loadSQL("./src/sql/user_permission/select_by_user_id.sql");
        const [permRows] = await connection.execute(sqlPerm, [user.user_id]);
        if (permRows.length > 0) {
            user.permissions = permRows;
        } else {
            user.permissions = [];
        }

        const sqlUsers = loadSQL("./src/sql/users/select.sql");
        const [usersRows] = await connection.execute(sqlUsers, [user.user_id]);
        if (usersRows.length > 0) {
            user.users = usersRows;
        } else {
            user.users = [];
        }
        const sqlRoles = loadSQL("./src/sql/roles/select.sql");
        const [rolesRows] = await connection.execute(sqlRoles, [user.user_id]);
        if (rolesRows.length > 0) {
            user.roles = rolesRows;
        } else {
            user.roles = [];
        }
        const sqlUserRole = loadSQL("./src/sql/user_role/select_by_user_id.sql");
        const [roles] = await connection.execute(sqlUserRole, [user.user_id]);

        const roleNames = roles.map(r => r.role_name);

        let finalRoles = roles;

        if (roleNames.includes("admin")) {
            const sqlAllRoles = loadSQL("./src/sql/user_role/select.sql");
            const [allRoles] = await connection.execute(sqlAllRoles);
            finalRoles = allRoles;
        }

        user.user_role = finalRoles.length > 0 ? finalRoles : [];

    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: error.message
        }));
        return;

    } finally {
        if (connection) connection.release();
    }
    res.writeHead(200, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(user));
    return
}