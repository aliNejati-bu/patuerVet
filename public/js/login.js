async function login() {
    const loginForm = document.querySelector("#login_form");
    const [mobileInput, passwordInput] = [
        document.querySelector('#mobile_input'),
        document.querySelector('#password_input'),
    ];
    loginForm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        startLoading();
        try {
            const loginRequestResult = await axios.post(serverAdr + "/api/v1/auth/login", {
                mobile: mobileInput.value,
                password: passwordInput.value
            });
            successesToast("ورود موفق");
            saveToken(loginRequestResult.data.data.token, (+loginRequestResult.data.data.tokenLifeTime * 1000) + Date.now());
            window.location.href = urls.dashboard;
        } catch (e) {
            endLoading();
            setTimeout(() => {
                basicError("شماره موبایل و رمز عبور سازگاری");
            }, 100);
        }
    });
}