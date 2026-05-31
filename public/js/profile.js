//(async () => {
//    let userProfileLogin = profile.textContent.trim();
//    const dataProfile = {};
//    dataProfile.login = "Davydenko";
//    profile.textContent = userProfileLogin.replace(/X/g, dataProfile.login);
//    id.value = "1";
//    fio.value = "Davydenko Dmitry O.";
//    birthDate.value = "2001-07-06";
//})();
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const user = new Object(null);
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


(async (api) => {

    const response = await fetch(api);
    const data = await response.json();
    let userProfileLogin = profile.textContent.trim();
    const dataProfile = {};
    dataProfile.login = "Davydenko";
    profile.textContent = userProfileLogin.replace(/X/g, dataProfile.login);

    const user = new Object(null);
    id.value = data.user_id;
    user.fio = fio.value;
    user.birthDate = birthDate.value;
    return { data, user }
})("/api/profile")
    .then(user => {
        console.log(user);
    })