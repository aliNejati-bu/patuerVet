window.addEventListener('load', async () => {
    let token = localStorage.token;
    if (!token) {
        addError('no login');
        console.log(":")
        window.location = '/login';
    }
    window.token = token;
    try {
        let user = await axios.get(serverAdr + '/api/v1/auth/me', {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        window.user = user.data.data;
        start();
    } catch (e) {
        addError('no login');
        console.log(e)
        window.location = '/login';
    }
});

async function oauth() {
    try {
        let result = await axios.get(serverAdr + "/api/v1/twitter/auth-link", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        window.location = result.data.data.url;
    } catch (e) {
        basicError('token expire login again!!!');
        setTimeout(() => {
            //window.location = "/login"
        }, 1000)
    }
}

async function start() {
    try {
        let usrnameWrapper = document.getElementById('usernameWrapper');
        let playGround = document.getElementById('playground');
        usrnameWrapper.innerHTML = `Hello ${user.name}`;
        if (!user.twitter.refreshToken) {
            playGround.innerHTML = `<div class="mt-5">

            <button class="btn btn-primary w-100" onclick="oauth()">
                <i class="fa fa-twitter"></i>
                connect Twitter account.
            </button>
        </div>`;
            endLoading();
        } else {
            const user = await axios.get(serverAdr + "/api/v1/twitter/profile", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            playGround.innerHTML = `<div class="d-flex align-items-center justify-content-center mt-4">
<img src="${user.data.data.profile_image_url}" alt="">
<div class="user-name" id="user-name">${user.data.data.name}</div>

</div>
<div class="form-group">
    <label for="tweet-input">Write Twitte.</label>
    <textarea class="form-control" id="tweet-input" rows="3"></textarea>
  </div>
  <div class="form-group">
 <label for="tweet-date">Write Twitte.</label>
    <input type="datetime-local" class="form-control" id="tweet-date"/>
    </div>

  <buttnon onclick="SendTweet()" class="btn btn-primary w-100 mt-3">Twitte</buttnon>
 

`

            endLoading();
        }
    } catch (e) {
        startLoading();
        basicError('connection Error.');
    }


}

async function SendTweet() {
    startLoading();
    let tweetValue = document.getElementById('tweet-input').value;
    let tweetTime = document.getElementById('tweet-date').value;
    try {
        if (tweetTime) {
            let d = await axios.post(serverAdr + "/api/v1/twitter/scheduling-tweet", {
                tweet: tweetValue,
                time: new Date(tweetTime)
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            successesToast('tweeted!!!!!');
            endLoading();
        } else {
            let d = await axios.post(serverAdr + "/api/v1/twitter/tweet", {
                tweet: tweetValue
            }, {
                headers: {
                    "Authorization":`Bearer ${token}`
                }
            });
            successesToast('tweeted!!!!!');
            endLoading();
        }
    } catch (e) {
        console.log(e);
        basicError('faillddld');
    }
}