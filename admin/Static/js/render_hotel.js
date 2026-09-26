import { BASE_URL } from "../../../base_url.js";
import { refresh_token } from "../../../refresh_token.js";
import { confirmBeforeAction } from "./admin_panel.js";
import { countries } from "../../../countries.js"
import { t } from "../../text_translations.js";
import { showToast } from "../../../hotels/Static/js/propertyDashboard.js";

export async function render_hotel_dashboard() {
    const contentRight = document.getElementById('contentRight');

    let table_html = ''

    table_html = `
            <table id="dashboardTable">
                <thead>
                    <tr>
                        <th id="thead1">${t('hotelLocation')}</th>
                        <th id="thead2">${t('totalRooms')}</th>
                        <th id="thead3">${t('averagePrice')}</th>
                        <th id="thead4">${t('actions')}</th>
                    </tr>
                </thead>
                <tbody id="tBody"></tbody>
            </table>
        `
    contentRight.innerHTML = table_html


    const contentTitle = document.getElementById('contentTitle');
    const actionBtn = document.getElementById('actionBtn');
    actionBtn.innerHTML = `<button class="add-btn" id="addHotelBtn">${t('addNewHotel')}</button>`

    const access_token = localStorage.getItem('access_token');

    if (access_token) {
        const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/hotel/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json()
            render_hotel_table(data);
            contentTitle.innerHTML = `${t('myHotelsCount')}(${data.length})`
        } else {
            console.log('Error')
        }
    } else {
        console.log('unauthorised')
    }

    document.getElementById('addHotelBtn').addEventListener('click', (event) => {
        event.preventDefault();
        render_add_hotel_dashboard()
    })

    document.getElementById('tBody').addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.classList.contains('edit-hotel')) {
            const hotel_id = event.target.dataset.id;
            render_add_hotel_dashboard(hotel_id)

        } else if (event.target.classList.contains('delete-hotel')) {
            const hotel_id = event.target.dataset.id;
            confirmBeforeAction(`${t('deleteRoomConfirm')}`, () => {
                delete_hotel(hotel_id)
            });

        }
    })



}
// ==============================
function render_hotel_table(data) {
    const tBody = document.getElementById('tBody');
    let html = '';

    data.forEach((object) => {
        html += `
            <tr>
                <td data-label="${t('hotelLocation')}">${object.hotel_name} | ${object.city.toUpperCase()}, ${object.country_name.toUpperCase()}</td>
                <td data-label="${t('totalRooms')}">${object.room_count}</td>
                <td data-label="${t('averagePrice')}">Average price</td>
                <td data-label="${t('actions')}">
                    <div>
                        <a>${t('view')}</a>
                        <a id="EditHotel" class="edit-hotel" data-id="${object.hotel_id}">${t('edit')}</a>
                        <a id="DeleteHotel" class="delete-hotel" data-id="${object.hotel_id}">${t('delete')}</a>
                    </div>
                </td>
            </tr>
        `
    })

    tBody.innerHTML = html;
}
// ==============================

async function render_add_hotel_dashboard(hotel_id = undefined) {
    const contentRight = document.getElementById('contentRight');
    contentRight.innerHTML = ''

    // =====IS EDITABLE=====
    const isEditable = hotel_id !== undefined
    // ---------------------

    let html = ''
    // =========COUNTRIES============
    let html_countries = ''
    countries.forEach((country_object) => {
        html_countries += `
            <option value="${country_object.country_name}" data-country-code=${country_object.country_code}>${country_object.country_code}</option>
        `
    })
    // ==================

    html = `
        <form id="hotelForm">
            <div>
                <h3>${t('basicInformation')}</h3>
                <div>
                    <label>${t('hotelName')}</label>
                    <input type="text" placeholder="Hotel Name" id="addHotelName" required>

                    <label>${t('location')}</label>
                    <div>
                        <input type="text" list="country-list" placeholder="${t('hotelCountry')}" id="addHotelCountry" required>

                        <datalist id="country-list">
                            ${html_countries}
                        </datalist>

                        <input type="text" placeholder="${t('hotelCity')}" id="addHotelCity" required>
                        <input type="text" placeholder="${t('hotelAddress')}" id="addHotelAddress" required>
                    </div>
                </div>
            </div>


            <div>
                <h3>${t('hotelDetails')}</h3>
                <div>
                    <label>${t('hotelDetails')}</label>
                    <textarea id="addHotelDescription" required></textarea>
                </div>
            </div>

            <div>
                <label>${t('media')}</label>
                <input type="file" id="addHotelImages" multiple accept="image/*" ${isEditable ? '' : 'required'}>
            </div>

            <div>
                <button id="saveHotelBtn" type="button">${isEditable ? `${t('editHotel')}` : `${t('saveHotel')}`}</button>
                <button id="cancelSaveHotelBtn" type="button">${t('cancel')}</button>
            </div>
        </form>
    `
    contentRight.innerHTML = html

    // -----------------IF EDITABLE-------------
    const hotel_name = document.getElementById('addHotelName');
    const hotel_country = document.getElementById('addHotelCountry');
    const hotel_city = document.getElementById('addHotelCity');
    const hotel_address = document.getElementById('addHotelAddress');
    const hotel_description = document.getElementById('addHotelDescription');

    if (isEditable) {
        try {
            const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/hotel/${hotel_id}`, {
                method: 'GET',
            })

            if (response.ok) {
                const data = await response.json();
                hotel_name.value = data.hotel_name || ''
                hotel_country.value = data.country_name || ''
                hotel_city.value = data.city || ''
                hotel_address.value = data.address || ''
                hotel_description.value = data.hotel_description || ''
            } else {
                showToast(`${t('loadError')}`)
            }
        } catch (error) {
            console.error(error)
        }

    }
    // =======================

    document.getElementById('cancelSaveHotelBtn').addEventListener('click', (e) => {
        e.preventDefault();
        render_hotel_dashboard()

    })

    document.getElementById('saveHotelBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        if (isEditable) {
            update_hotel(hotel_id);
        } else {
            add_hotel();
            
        }

    })


}

// =============ADD HOTEL=================
async function add_hotel() {
    const access_token = localStorage.getItem('access_token')
    const hotel_name = document.getElementById('addHotelName').value;
    const hotel_city = document.getElementById('addHotelCity').value;
    const hotel_address = document.getElementById('addHotelAddress').value;
    const hotel_description = document.getElementById('addHotelDescription').value;
    const hotel_images = document.getElementById('addHotelImages').files

    // COUNTRY
    const hotel_country_name = document.getElementById('addHotelCountry').value;
    let hotel_country_code = ''
    const matchedOption = document.querySelector(`#country-list option[value="${hotel_country_name}"]`)
    if( matchedOption){
        hotel_country_code = matchedOption.dataset.countryCode
    }else{
        showToast('choose an appropriate country')
        return
    }


    if (hotel_images.length === 0) {
        showToast('Choose at least one photo')
        return
    };


    if (access_token) {
        const formData = new FormData()
        for (let i = 0; i < hotel_images.length; i++) {
            formData.append('hotel_images', hotel_images[i])
        };

        formData.append('hotel_name', hotel_name);
        formData.append('country', hotel_country_code);
        formData.append('city', hotel_city);
        formData.append('address', hotel_address);
        formData.append('hotel_description', hotel_description);


        const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/hotel/`, {
            method: 'POST',
            headers: {},
            body: formData
        });

        if (response.ok) {
            showToast('Created', 'success')
            render_hotel_dashboard();
        } else {
            const error = await response.json()
            console.log('Validation errors:', error)
        }
    }
}

// =============UPDATE HOTEL=================
async function update_hotel(hotel_id) {
    const access_token = localStorage.getItem('access_token')
    const hotel_name = document.getElementById('addHotelName').value;
    const hotel_city = document.getElementById('addHotelCity').value;
    const hotel_address = document.getElementById('addHotelAddress').value;
    const hotel_description = document.getElementById('addHotelDescription').value;
    const hotel_images = document.getElementById('addHotelImages').files

    // COUNTRY
    const hotel_country_name = document.getElementById('addHotelCountry').value;
    let hotel_country_code = ''
    const matchedOption = document.querySelector(`#country-list option[value="${hotel_country_name}"]`)
    if( matchedOption){
        hotel_country_code = matchedOption.dataset.countryCode
    }else{
        showToast(`${t('chooseCountryAlert')}`)
        return
    }

    if (access_token) {
        const formData = new FormData()

        if (hotel_images.length > 0) {
            for (let i = 0; i < hotel_images.length; i++) {
                formData.append('hotel_images', hotel_images[i])
            }
        };

        formData.append('hotel_name', hotel_name);
        formData.append('country', hotel_country_code);
        formData.append('city', hotel_city);
        formData.append('address', hotel_address)
        formData.append('hotel_description', hotel_description);

        const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/hotel/${hotel_id}/`, {
            method: 'PATCH',
            body: formData
        })

        if (response.ok) {
            render_hotel_dashboard();
            showToast(`${t('hotelUpdatedSuccess')}`, 'success')
        } else {
            const error = await response.json()
            console.log('Validation errors:', error)
        }
    }
}

async function delete_hotel(hotel_id) {
    const access_token = localStorage.getItem('access_token')
    if (access_token){
        const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/hotel/${hotel_id}/`, {
            method: 'DELETE',
        })

        if (response.ok) {
            render_hotel_dashboard();
        } else {
            const error = await response.json()
            console.log('Validation errors:', error)
        }
    }
}