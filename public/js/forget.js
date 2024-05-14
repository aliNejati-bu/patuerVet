let mobile = "";
let canResend = false;
let c = 180;


function generateForgetCodeInput() {
    document.querySelector('#wrapper').innerHTML = `
            <form id="forget_form">
                    <div class="input-group mb-3">
                        <input name="code" type="number" class="form-control" placeholder="کد تایید" id="code_input">
                        <div class="input-group-append">
                            <span class="fa fa-code input-group-text"></span>
                        </div>
                    </div>
                    <div class="input-group mb-3">
                        <input type="password" class="form-control" placeholder="رمز عبور" id="password_input">
                        <div class="input-group-append">
                            <span class="fa fa-star input-group-text"></span>
                        </div>
                    </div>
                    <div class="input-group mb-3">
                        <input type="password" class="form-control" placeholder="تایید رمز عبور" id="password_confirm_input">
                        <div class="input-group-append">
                            <span class="fa fa-star input-group-text"></span>
                        </div>
                    </div>
                    <div class="row">
                        <!-- /.col -->
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary btn-block btn-flat">بازیابی</button>
                        </div>
                        <!-- /.col -->
                    </div>
                </form>
                <div class="col-12 text-center mt-2">
                <a href="#" id="resend">
                    ارسال مجدد کد در 
                    (
                    <span id="time">${c}</span>
                    ثانیه
                    )
                    </a>
                </div>
            `;

    document.querySelector('#forget_form').addEventListener('submit', forgetHandler);

    setInterval(() => {
        if (c == 0) {
            canResend = true;
            document.getElementById('resend').innerHTML = "کد را دریافت نکردید؟ ارسال مجدد.";

        } else {
            document.getElementById('time').innerHTML = c;
            c--;
        }
    }, 1000);
    document.getElementById('resend').addEventListener('click', resendCode);

}

async function forget() {
    let checkResult = localStorage.getItem('forget_code');
    if (checkResult) {
        let code = JSON.parse(checkResult);
        let distance = (Date.now() - code.sent) / 1000;
        if (distance < 180) {
            c = 180 - parseInt(distance);
            generateForgetCodeInput();
            mobile = code.mobile;
            endLoading();
            return;
        }
    }
    endLoading();
    const loginForm = document.querySelector("#login_form");
    const [mobileInput] = [
        document.querySelector('#mobile_input'),
    ];
    loginForm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        startLoading()
        mobile = mobileInput.value;
        if (!mobile) {
            basicError("شماره موبایل اشتباه است.");
            endLoading();
            return;
        }
        try {
            let result = await axios.post(serverAdr + "/api/v1/auth/sendCode", {
                mobile: mobileInput.value
            });
            endLoading();
            successesToast("کد تایید برای شماره ارسال شد.");
            generateForgetCodeInput();
            localStorage.setItem("forget_code", JSON.stringify({
                sent: Date.now(),
                mobile: mobile
            }));

        } catch (e) {
            if (e.response.data.status == "Duplicate") {
                basicError("یک کد برای شما ارسال شده است");
            } else {
                basicError("شماره اشتباه است.");

            }
            endLoading();
        }
    });
}


async function resendCode() {
    let b = canResend;
    if (canResend)
        try {
            canResend = false;
            let result = await axios.post(serverAdr + "/api/v1/auth/sendCode", {
                mobile: mobile
            });
            successesToast("کد تایید برای شماره ارسال شد.");
            c = 180;
            generateForgetCodeInput();
            localStorage.setItem("forget_code", JSON.stringify({
                sent: Date.now()
            }));

        } catch (e) {
            canResend = b;
            basicError("خطا در ارسال.")
        }
}

async function forgetHandler(ev) {
    ev.preventDefault();
    startLoading();
    const [codeInput, passwordInput, confirmPasswordInput] = [
        document.querySelector("#code_input"),
        document.querySelector("#password_input"),
        document.querySelector("#password_confirm_input"),
    ];


    try {
        if (passwordInput.value.length < 8) {
            basicError("طول رمز عبور بیشتر از 8 حرف باشد.");
            endLoading();
            return;
        }


        if (passwordInput.value != confirmPasswordInput.value) {
            basicError("رمز عبور و تکرار آن سازگار نیست.");
            endLoading();
            return;
        }

        await axios.post(serverAdr + "/api/v1/auth/verifyCode", {
            mobile: mobile,
            code: codeInput.value,
            password: passwordInput.value
        })

        successesToast("رمز با موفقیت تغیر یافت");
        setTimeout(() => {
            window.location.href = urls.login;
        }, 1000);
    } catch (e) {
        basicError("کد اشتباه است.");
        endLoading();
    }

}