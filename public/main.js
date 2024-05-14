let serverAdr = 'http://localhost:3000';

const urls = {
    dashboard: "/dashboard",
    login: "/login"
}


function endLoading() {
    document.querySelector('.loading').style.display = 'none';
}

function startLoading() {
    document.querySelector('.loading').style.display = 'flex';
}

function successesToast(msg, d = 2000) {
    Toastify({
        text: msg,
        duration: d,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "#00b09b",
        }
    }).showToast();
}

function basicError(msg, d = 10000) {
    Toastify({
        text: msg,
        duration: d,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "#b00058",
        },
    }).showToast();
}

let errors;
try {
    errors = JSON.parse(localStorage.errors);
} catch (e) {
    errors = false;
}
errors = errors?.e;
if (errors) {
    if (Array.isArray(errors)) {
        localStorage.errors = JSON.stringify({e: []});
    } else {
        localStorage.errors = JSON.stringify({e: []});
        errors = [];
    }
} else {
    localStorage.errors = JSON.stringify({e: []});
    errors = [];
}

errors.forEach(e => {
    basicError(e);
})

function addError(msg) {
    errors.push(msg);
    localStorage.errors = JSON.stringify({e: errors});
}


function saveToken(token, endAt) {
    localStorage.setItem('token', JSON.stringify({
        token,
        endAt
    }));
}