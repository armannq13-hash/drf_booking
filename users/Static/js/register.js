import { BASE_URL } from "../../../base_url.js";
import { showToast } from "../../../hotels/Static/js/propertyDashboard.js";
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

const registerBtn = document.getElementById('registerBtn');

async function register_user() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const isBusiness = document.getElementById('isBusinessCheck').checked;

    if (!username || !password || !password2 || !phoneNumber || !email){
        showToast(`${t('fillAllFields')}`)
    }

    if (password === password2) {
        const response = await fetch(`${BASE_URL}/users/api/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                phone_number: phoneNumber,
                is_business: isBusiness,
            })
        })

        if (response.ok) {
            showToast('Success!', 'success')
            window.location = "/hotels/templates/home.html"
        }
    }
}

registerBtn.addEventListener('click', (event) => {
    event.preventDefault();
    register_user()

})


// ===============TRANSLATING STATIC TEXT============
document.getElementById('usernameLabel').innerHTML = `${t('username')}`
document.getElementById('passwordLabel').innerHTML = `${t('password')}`
document.getElementById('passwordConfirmLabel').innerHTML = `${t('passwordConfirmation')}`
document.getElementById('phoneNumberLabel').innerHTML = `${t('phoneNumber')}`
document.getElementById('registerBtn').innerHTML = `${t('registerTitle')}`
document.getElementById('isBusiness').innerHTML = `${t('createBusinessAccount')}`
document.getElementById('signInLink').innerHTML = `${t('signIn')}`
document.getElementById('alreadySignedIn').innerHTML = `${t('alreadySignedIn')}`
document.getElementById('signInLink').innerHTML = `${t('signIn')}`