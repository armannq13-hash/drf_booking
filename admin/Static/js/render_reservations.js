import { BASE_URL } from "../../../base_url.js";
import { refresh_token } from "../../../refresh_token.js";
import { t } from "../../text_translations.js";
import { showToast } from "../../../hotels/Static/js/propertyDashboard.js";


export async function render_reservations_dashboard() {
    const contentRight = document.getElementById('contentRight');

    document.getElementById('actionBtn').innerHTML = ''

    let table_html = ''

    table_html = `
        <table id="dashboardTable">
            <thead>
                <tr>
                    <th id="thead1">${t('roomHotel')}</th>
                    <th id="thead2">${t('checkIn')}</th>
                    <th id="thead3">${t('checkOut')}</th>
                    <th id="thead4">${t('user')}</th>
                    <th id="thead5">${t('status')}</th>
                </tr>
            </thead>
            <tbody id="tBody"></tbody>
        </table>
    `
    contentRight.innerHTML = table_html

    const access_token = localStorage.getItem('access_token');

    if (access_token){
        const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/reservations/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok){
            showToast(`${t('somethingWentWrong')}`)
            return
        }

        const data = await response.json()
        render_reservation_table(data);

        const contentTitle = document.getElementById('contentTitle');
        contentTitle.innerHTML = `${t('myBookingsCount')}(${data.length})`
    }
}


function render_reservation_table(data){
    const tBody = document.getElementById('tBody');
    let html = '';

    data.forEach((object) => {
        html += `
            <tr>
                <td data-label="${t('roomHotel')}">${object.room} | ${object.hotel}</td>
                <td data-label="${t('checkIn')}">${object.check_in}</td>
                <td data-label="${t('checkOut')}">${object.check_out}</td>
                <td data-label="${t('user')}">${object.user}</td>
                <td data-label="${t('status')}">${object.status}</td>
            </tr>
        `
    })

    tBody.innerHTML = html;
}