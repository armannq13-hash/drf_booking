import { BASE_URL } from "../../../base_url.js";
import { refresh_token } from "../../../refresh_token.js";
import { t } from "../../text_translations_authorization.js";



// ========LANGUAGE CHANGE EVENT LISTENER============
const currentLang = localStorage.getItem('user_language') || 'en';

const changeLangSelector = document.getElementById('changeLangSelector');

if (changeLangSelector){
    changeLangSelector.value = currentLang;

    changeLangSelector.addEventListener('change', (event) => {
        localStorage.setItem('user_language', event.target.value);
        window.location.reload();
    })
}
// =============================

const loginBtn = document.getElementById('loginBtn');

async function login_user() {
    const email = document.getElementById('emailLogin').value;
    const password = document.getElementById('passwordLogin').value;

    const response = await fetch(`${BASE_URL}/users/api/token/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })


    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        const username_response = await refresh_token(`${BASE_URL}/home/give/username/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const username = username_response.ok ? await username_response.json() : ''

        localStorage.setItem('is_business', username.is_business);
        localStorage.setItem('username', username.username);

    }
}

loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    await login_user()
    window.location = "/hotels/templates/home.html"
})



// =============TRANSLATING STATIC TEXT============
document.getElementById('signInOrCreate').innerHTML = `${t('signInOrCreate')}`
document.getElementById('usernameLabel').innerHTML = `${t('username')}`
document.getElementById('passwordLabel').innerHTML = `${t('password')}`
document.getElementById('loginBtn').innerHTML = `${t('signIn')}`
document.getElementById('haventRegisteredYet').innerHTML = `${t('notRegisteredYet')}`
document.getElementById('register').innerHTML = `${t('registerTitle')}`




