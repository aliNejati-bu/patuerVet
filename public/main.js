let serverAdr = 'http://127.0.0.1:3000';

function endLoading() {
    document.querySelector('.loading').style.display = 'none';
}

function startLoading() {
    document.querySelector('.loading').style.display = 'flex';
}

function successesToast(msg) {
    Toastify({
        text: msg,
        duration: 2000,
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

function basicError(msg) {
    Toastify({
        text: msg,
        duration: 2000,
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