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
        btn.innerText = 0 || "Успешно";

    }
    catch (error) {
        btn.innerText = "Ошибка соединения с сервером";
        console.error(error);
    }

});
quit.addEventListener("submit", async function (event) {
    event.preventDefault();
    const user = new Object(null);
    if (!fio.value.trim()) return fio.focus();
    if (!birthDate.value.trim()) return birthDate.focus();
    user.fio = fio.value;
    user.birthDate = birthDate.value;
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
        btn.innerText = 0 || "Успешно";

    }
    catch (error) {
        btn.innerText = "Ошибка соединения с сервером";
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


//(async (api) => {

//    const response = await fetch(api);
//    const data = await response.json();
//    profile.textContent = profile.textContent.trim().replace(/X/g, data.profile.login);

//    id.value = data.user_id;
//    fio.value = data.profile.fio;
//    birthDate.value = data.profile.birth_date?.split("T")[0] ?? "";
//    return data;
//})("/api/profile")
//    .then(user => {
//        console.log(user);
//    })