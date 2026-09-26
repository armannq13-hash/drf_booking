import { BASE_URL } from "../../../base_url.js";
import { refresh_token } from "../../../refresh_token.js";
import { confirmBeforeAction } from "./admin_panel.js";
import { t } from "../../text_translations.js";
import { showToast } from "../../../hotels/Static/js/propertyDashboard.js";

export async function render_rooms_dashboard() {
    const contentRight = document.getElementById('contentRight');

    let table_html = ''

    table_html = `
            <table id="dashboardTable">
                <thead>
                    <tr>
                        <th id="thead1">${t('roomTypeHotel')}</th>
                        <th id="thead2">${t('quantityOfRooms')}</th>
                        <th id="thead3">${t('personCapacity')}</th>
                        <th id="thead4">${t('price')}</th>
                        <th id="thead5">${t('actions')}</th>
                    </tr>
                </thead>
                <tbody id="tBody"></tbody>
            </table>
        `
    contentRight.innerHTML = table_html
    const contentTitle = document.getElementById('contentTitle');
    const actionBtn = document.getElementById('actionBtn');
    actionBtn.innerHTML = `<button class="add-btn" id="addRoomBtn">${t('addNewRoom')}</button>`

    const access_token = localStorage.getItem('access_token');

    if (access_token) {
        const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/rooms/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            render_rooms_table(data)
            contentTitle.innerHTML = `${t('myRoomsCount')}(${data.length})`
        }
    }

    // ---------------------------
    document.getElementById('addRoomBtn').addEventListener('click', (e) => {
        e.preventDefault()
        render_add_rooms_dashboard();
    })

    document.getElementById('tBody').addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.classList.contains('edit-room')) {
            const room_id = e.target.dataset.id;
            render_add_rooms_dashboard(room_id)
        } else if (e.target.classList.contains('delete-room')) {
            const room_id = e.target.dataset.id;
            confirmBeforeAction(`${t('deleteRoomConfirm')}`, () => {
                delete_room(room_id)
            })
        }
    })


}
// ==============================

function render_rooms_table(data) {
    const tBody = document.getElementById('tBody');
    let html = ''

    data.forEach((object) => {
        html += `
            <tr>
                <td data-label="${t('roomTypeHotel')}">${object.room_title} | ${object.hotel_detail.hotel_name}</td>
                <td data-label="${t('quantityOfRooms')}">${object.rooms_quantity}</td>
                <td data-label="${t('personCapacity')}">${object.max_guests_amount}</td>
                <td data-label="${t('price')}">${object.price_one_night}</td>
                <td data-label="${t('actions')}">
                    <div>
                        <a>${t('view')}<a>
                        <a class="edit-room" id="RoomEdit" data-id="${object.room_id}">${t('edit')}<a>
                        <a class="delete-room" id="RoomDelete" data-id="${object.room_id}">${t('delete')}</a>
                    </div>
                </td>
            </tr>
        `

        tBody.innerHTML = html
    })
}

// ==============================
async function render_add_rooms_dashboard(room_id = undefined) {
    const contentRight = document.getElementById('contentRight');
    contentRight.innerHTML = ''
    // ============IS EDITABLE=================
    const isEditable = room_id !== undefined

    // ============GETTING INSTANCE IF EDITABLE========
    let roomData = null;

    if (isEditable) {
        const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/rooms/${room_id}/`, {
            method: 'GET'
        })

        if (response.ok) {
            roomData = await response.json()
        } else {
            showToast(`${t('roomLoadError')}`)
            return
        }
    }


    // ---------GETTING FACILITIES-----------
    let checkBoxFacilities = ''
    const facilities = await refresh_token(`${BASE_URL}/admin/panel/api/admin/facilities/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (facilities.ok) {
        const facilitiesData = await facilities.json();
        facilitiesData.forEach((facility) => {
            let isChecked = false;

            if (isEditable && roomData && roomData.room_facilities) {
                isChecked = roomData.room_facilities.some((item) => {
                    return (typeof item === 'object' ? item.id : item) === facility.id
                })
            }

            checkBoxFacilities += `
                <label>
                    <div class="icon-wrapper">
                        ${facility.facility_svg}
                    </div>
                    <input type="checkbox" value="${facility.id}" class="addRoomFacilities" ${isChecked ? 'checked' : ''}>
                    <span>${facility.name}</span>
                </label>
            `
        })

    } else {
        console.log('JSON ERROR FACILITIES')
    }

    // ---------GETTING THE OWNER'S HOTELS----------
    let selectHotelsHTML = ''
    const ownerHotels = await refresh_token(`${BASE_URL}/admin/panel/api/admin/owner/hotels/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (ownerHotels.ok) {
        const ownerHotelsData = await ownerHotels.json();

        let currentHotelId = null
        if (isEditable && roomData && roomData.hotel) {
            currentHotelId = typeof roomData.hotel === 'object' ? roomData.hotel.hotel_id : roomData.hotel
        }

        ownerHotelsData.forEach((hotel) => {
            const isSelected = (currentHotelId === hotel.hotel_id) ? 'selected' : ''
            selectHotelsHTML += `
                <option value="${hotel.hotel_id}" ${isSelected ? 'selected' : ''}>${hotel.hotel_name}</option>
            `
        })
    } else {
        console.log('JSON ERROR OWNER HOTEL')
    }

    // -----------GETTING ROOM CATEGORIES------------
    let checkBoxCategories = ''
    const roomCategories = await refresh_token(`${BASE_URL}/admin/panel/api/admin/room/categories/`, {
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (roomCategories.ok) {
        const text = await roomCategories.text()
        const roomCategoriesData = text ? JSON.parse(text) : []
        roomCategoriesData.forEach((category) => {
            let isChecked = false;

            if (isEditable && roomData && roomData.room_categories) {
                isChecked = roomData.room_categories.some((item) => {
                    return (typeof item === 'object' ? item.id : item) === category.id
                })
            }

            checkBoxCategories += `
                <label>
                    <input type="checkbox" value="${category.id}" class="addRoomCategory" ${isChecked ? 'checked' : ''}>
                    <span>${category.name}</span>
                </label>
            `
        })

    } else {
        console.log('JSON ERROR CATEGORY')
    }
    // --------------------------

    let html = ''

    html = `
        <form>
            <div>
                <h3>${t('basicInformation')}</h3>
                <div>
                    <label>${t('hotel')}</label>
                    <select id="addRoomHotel" required>
                        ${selectHotelsHTML}
                    </select>

                    <label>${t('roomTitle')}</label>
                    <input type="text" placeholder="Room Type" id="addRoomTitle" required value="${isEditable ? roomData.room_title : ''}">

                    <label>${t('quantityOfRooms')}</label>
                    <input type="number" required id="addRoomQuantity" value="${isEditable ? roomData.rooms_quantity : ''}">

                    <label>${t('priceOneNight')}</label>
                    <input type="number" required id="addRoomPrice" value="${isEditable ? roomData.price_one_night : ''}">

                    <label>${t('maxGuestsAmount')}</label>
                    <input type="number" required id="addRoomGuestsAmount" value="${isEditable ? roomData.max_guests_amount : ''}">
                </div>
            </div>


            <div>
                <h3>${t('hotelDetails')}</h3>
                <div>
                    <label>${t('roomDescription')}</label>
                    <textarea id="addRoomDescription" required >${isEditable ? roomData.room_description : ''}</textarea>
                </div>
            </div>

            <div>
                <label>${t('facilities')}</label>
                ${checkBoxFacilities}
            </div>

            <div>
                <label>${t('roomCategories')}</label>
                ${checkBoxCategories}
            </div>

            <div>
                <label>${t('media')}</label>
                <input type="file" id="addRoomImages" multiple accept="images/*" ${isEditable ? '' : 'required'}>
            </div>

            <div>
                <button id="saveRoomBtn" type="button">${isEditable ? `${t('editRoom')}` : `${t('saveRoom')}`}</button>
                <button id="cancelSaveRoomBtn" type="button">${t('cancel')}</button>
            </div>
        </form>
    `
    contentRight.innerHTML = html

    document.getElementById('cancelSaveRoomBtn').addEventListener('click', (e) => {
        e.preventDefault();
        render_rooms_dashboard()

    })

    document.getElementById('saveRoomBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        if (isEditable) {
            await update_room(room_id)
        } else {
            await add_room()
        }
    })

}

// ==============================
async function add_room() {
    const access_token = localStorage.getItem('access_token');
    const room_hotel = document.getElementById('addRoomHotel').value;
    const room_title = document.getElementById('addRoomTitle').value;
    const rooms_quantity = document.getElementById('addRoomQuantity').value;
    const price_one_night = document.getElementById('addRoomPrice').value;
    const max_guests_amount = document.getElementById('addRoomGuestsAmount').value;
    const room_description = document.getElementById('addRoomDescription').value;
    const room_images = document.getElementById('addRoomImages').files;


    const selected_room_facilities = document.querySelectorAll('.addRoomFacilities:checked');
    const room_facilities = Array.from(selected_room_facilities).map(facility => facility.value)

    const selected_room_categories = document.querySelectorAll('.addRoomCategory:checked');
    const room_categories = Array.from(selected_room_categories).map(category => category.value)

    if (room_images.length === 0) {
        showToast(`${t('selectImageAlert')}`)
        return
    }


    if (access_token) {
        const formData = new FormData
        for (let i = 0; i < room_images.length; i++) {
            formData.append('room_images', room_images[i])
        }

        formData.append('hotel', room_hotel);
        formData.append('rooms_quantity', rooms_quantity);
        formData.append('price_one_night', price_one_night);
        formData.append('room_title', room_title);
        formData.append('room_description', room_description);
        formData.append('max_guests_amount', max_guests_amount);

        room_categories.forEach((category_id) => {
            formData.append('room_categories', category_id)
        });

        room_facilities.forEach((facility_id) => {
            formData.append('room_facilities', facility_id)
        })

        const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/rooms/`, {
            method: 'POST',
            headers: {},
            body: formData
        })

        if (response.ok) {
            showToast(`${t('roomAddedSuccess')}`, 'success')
            render_rooms_dashboard();
        } else {
            const error = await response.json()
            console.log('Validation errors:', error)
        }

    }
}


async function update_room(room_id) {
    const access_token = localStorage.getItem('access_token');
    const room_hotel = document.getElementById('addRoomHotel').value;
    const room_title = document.getElementById('addRoomTitle').value;
    const rooms_quantity = document.getElementById('addRoomQuantity').value;
    const price_one_night = document.getElementById('addRoomPrice').value;
    const max_guests_amount = document.getElementById('addRoomGuestsAmount').value;
    const room_description = document.getElementById('addRoomDescription').value;
    const room_images = document.getElementById('addRoomImages').files;


    const selected_room_facilities = document.querySelectorAll('.addRoomFacilities:checked');
    const room_facilities = Array.from(selected_room_facilities).map(facility => facility.value)

    const selected_room_categories = document.querySelectorAll('.addRoomCategory:checked');
    const room_categories = Array.from(selected_room_categories).map(category => category.value)

    if (access_token) {
        const formData = new FormData();
        if (room_images.length > 0) {
            for (let i = 0; i < room_images.length; i++) {
                formData.append('room_images', room_images[i])
            }
        }

        formData.append('hotel', room_hotel);
        formData.append('rooms_quantity', rooms_quantity);
        formData.append('price_one_night', price_one_night);
        formData.append('room_title', room_title);
        formData.append('room_description', room_description);
        formData.append('max_guests_amount', max_guests_amount);


        room_categories.forEach((category_id) => {
            formData.append('room_categories', category_id)
        });

        room_facilities.forEach((facility_id) => {
            formData.append('room_facilities', facility_id)
        })

        const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/rooms/${room_id}/`, {
            method: 'PATCH',
            body: formData
        })

        if (response.ok) {
            render_rooms_dashboard();
            showToast('Room Updated', 'success')
        } else {
            const error = await response.json()
            console.log('Validation errors:', error)
        }
    }
}


async function delete_room(room_id) {
    const access_token = localStorage.getItem('access_token')
    if (access_token) {
        const response = await refresh_token(`${BASE_URL}/admin/panel/api/admin/rooms/${room_id}/`, {
            method: 'DELETE'
        })

        if (response.ok) {
            render_rooms_dashboard()
        } else {
            const error = await response.json()
            console.log('Validation errors:', error)
        }
    }
}