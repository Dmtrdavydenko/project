(async (api) => {

    const response = await fetch(api);
    const data = await response.json();
    console.log({ response, data });

    console.log(data.user_productions);
    //profile.textContent = profile.textContent.trim().replace(/X/g, data.profile.login);

    //id.value = data.user_id;
    //fio.value = data.profile.fio;
    //birthDate.value = data.profile.birth_date?.split("T")[0] ?? "";

    //const test = data.permissions.map(i => `<div class="label">${i.permission_name}</div><div>${i.description}</div>`).join("");
    //const test = data.permissions.map(i => `<div class="label">${i.permission_name}</div><div>${i.description}</div>`).join("");
    //console.log(test);
    // select options
    //data.roles.map(i=>`<opt>`)
    //const roles = data.roles
    //    .map(role => `
    //    <option value="${role.role_id}">
    //        ${role.role_name}
    //    </option>
    //`).join("");


    //select.innerHTML = roles;
    //userRole.innerHTML = data.user_role.map(i => `
    //<div class="label">${i.login}</div>
    //<div>${i.role_name}</div>
    //<button data-user=${i.user_id} data-role=${i.role_id} onclick="actorDelete(this);">Удалить</button>`).join("");

    //permission.innerHTML = data.permissions.map(i => `<div class="label">${i.permission_name}</div><div>${i.description}</div>`).join("");

    //users.innerHTML = data.users.map(i => `<div class="label">${i.login}</div><select data-user=${i.user_id} onchange="actorPermission(this);">${roles}</select>`).join("");
    //console.log(data);

    return data;
})("/api/weaving_logs/select")
    .then(data => {
        //const test = data.permissions.map(i => `<div class="label">${i.permission_name}</div><div>${i.description}</div>`).join("");
        //console.log(test);
        //permission.innerHTML = test;
        //console.log(data);
    })