//(async () => {
//    let userProfileLogin = profile.textContent.trim();
//    const dataProfile = {};
//    dataProfile.login = "Davydenko";
//    profile.textContent = userProfileLogin.replace(/X/g, dataProfile.login);
//    id.value = "1";
//    fio.value = "Davydenko Dmitry O.";
//    birthDate.value = "2001-07-06";
//})();
user.addEventListener("submit", async function (event) {
    event.preventDefault();

    const user = new Object(null);
    if (!fio.value.trim()) return fio.focus();

    if (!birthDate.value.trim()) return birthDate.focus();

    user.fio = fio.value;
    user.birthDate = birthDate.value;


    try {

        const response = await fetch("/api/profile/insert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user),
        });

        const result = await response.json();
        console.log(result);

        //result.message || "Успешно";
        btnSend.innerText = 0 || "Успешно";

    }
    catch (error) {
        btnSend.innerText = "Ошибка соединения с сервером";
        console.error(error);
    }

});
quit.addEventListener("submit", async function (event) {
    event.preventDefault();
    const user = new Object(null);
    try {

        const response = await fetch("/api/session/quit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user),
        });

        const result = await response.json();
        console.log(result);

        //result.message || "Успешно";
        btnQuit.innerText = 0 || "Успешно";
        window.location.href = result.redirect;
    }
    catch (error) {
        btnQuit.innerText = "Ошибка соединения с сервером";
        console.error(error);
    }

});
//(async (api) => {
//    async function updateUserProfile(api) {

//        const response = await fetch(api);
//        const data = await response.json();
//        let userProfileLogin = profile.textContent.trim();
//        const dataProfile = {};
//        dataProfile.login = "Davydenko";
//        profile.textContent = userProfileLogin.replace(/X/g, dataProfile.login);
//        id.value = "1";


//        const user = new Object(null);
//        user.fio = fio.value;
//        user.birthDate = birthDate.value;
//        return user
//    }
//    console.log(await updateUserProfile(api));
//})("/api/profile/insert");
async function actorPermission(select) {
    console.log({ user_id: select.dataset.user, role_id: select.value });

    const response = await fetch("/api/users/role", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: select.dataset.user,
            role_id: select.value
        }),
    });

    const result = await response.json();
    console.log(result);
    if (!result.success)
        alert(result.message);

}

(async (api) => {

    const response = await fetch(api);
    const data = await response.json();
    console.log(data);
    profile.textContent = profile.textContent.trim().replace(/X/g, data.profile.login);

    id.value = data.user_id;
    fio.value = data.profile.fio;
    birthDate.value = data.profile.birth_date?.split("T")[0] ?? "";

    //const test = data.permissions.map(i => `<div class="label">${i.permission_name}</div><div>${i.description}</div>`).join("");
    //const test = data.permissions.map(i => `<div class="label">${i.permission_name}</div><div>${i.description}</div>`).join("");
    //console.log(test);
    // select options
    //data.roles.map(i=>`<opt>`)
    const roles = data.roles
        .map(role => `
        <option value="${role.role_id}">
            ${role.role_name}
        </option>
    `).join("");

    
    //select.innerHTML = roles;
    userRole.innerHTML = data.user_pore.map(i => `<div class="label">${i.login}</div><div>${i.role_name}</div>`).join("");
    permission.innerHTML = data.permissions.map(i => `<div class="label">${i.permission_name}</div><div>${i.description}</div>`).join("")
    users.innerHTML = data.users.map(i => `<div class="label">${i.login}</div><select data-user=${i.user_id} onchange="actorPermission(this);">${roles}</select>`).join("");
    //console.log(data);

    return data;
})("/api/profile")
    .then(data => {
        //const test = data.permissions.map(i => `<div class="label">${i.permission_name}</div><div>${i.description}</div>`).join("");
        //console.log(test);
        //permission.innerHTML = test;
        //console.log(data);
    })