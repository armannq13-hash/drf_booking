import { BASE_URL } from "./base_url.js";
import { showToast } from "./hotels/Static/js/propertyDashboard.js";


export async function refresh_token(url, options) {
    const access_token = localStorage.getItem('access_token');

    if (!options.headers){
        options.headers = {}

        // =====ACCEPT LANGUAGE======
        const currentLang = localStorage.getItem('user_language');
        if (currentLang){
            options.headers['Accept-Language'] = currentLang
        }
        
    }


    if (access_token) {
        options.headers['Authorization'] = `Bearer ${access_token}`
    } else {
        return showToast('Log in')
    }


    let response = await fetch(url, options)


    if (response.status === 401) {
        const refresh_token = localStorage.getItem('refresh_token')
        if (!refresh_token) {
            showToast('Log in')
            return response

        }

        try {
            const refreshResponse = await fetch(`${BASE_URL}/users/api/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    refresh: refresh_token
                })
            })

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                const newAccessToken = data.access;


                // ===========SETTING NEW ACCESS TOKEN=============
                localStorage.setItem('access_token', newAccessToken);
                // ========SETTING IS BUSINESS AND USERNAME========
                const username_response = await refresh_token(`${BASE_URL}/home/give/username/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                const username = username_response.ok ? await username_response.json() : ''

                localStorage.setItem('is_business', username.is_business);
                localStorage.setItem('username', username.username)

                // =====================
                options.headers['Authorization'] = `Bearer ${newAccessToken}`

                response = await fetch(url, options)
            } else {
                localStorage.clear()
                showToast('Log in')
                return response
            }
        } catch (error) {
            console.log(error);
        }

    }

    return response
}