import { BASE_URL } from "../../../base_url.js";
import { refresh_token } from "../../../refresh_token.js";
import { t } from "../../text_translation.js";
// ==========CURRENT LANG========
const currentLang = localStorage.getItem('user_language') || 'en';

export async function render_hotel_dashboard(hotel) {
    const contentContainer = document.getElementById('contentContainer');
    contentContainer.innerHTML = ''

    let restBottomImages_html = ''
    const remainingImages = hotel.images.slice(1, 8)
    const remainingImagesCount = hotel.images.length > 7 ? hotel.images.length - 7 : 0
    const bottomImages = remainingImages.slice(2)
    // ========
    remainingImages.forEach((image, index) => {
        const isLastImage = index === bottomImages.length - 1;
        const isOverlay = isLastImage && remainingImagesCount > 0

        restBottomImages_html += `
            <div class="bottom-item">
                <img src="${image}" alt="${hotel.hotel_name}" loading="lazy">
                ${isOverlay ? `
                        <div class="photos-overlay">
                            +${remainingImagesCount} ${t('photosCount')}
                        </div>
                ` : ''}
                
            </div>
        `
    })

    // ========================
    let hotelDashboard_html = `
        <div class="hotel-dashboard-wrapper">
            <div class="hotel-address-name">
                <h3 class="hotel-name-dashboard">${hotel.hotel_name}</div>
                <p class="hotel-address">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align: -2px; margin-right: 4px; color: #0071c2;">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>${hotel.address ? hotel.address + ', ' : ''}${hotel.city || ''}, ${hotel.country || ''}</span>
                    
                </p>
            </div>

            <div class="images-container">
                <div class="image-main">
                    <img src="${hotel.images[0]}" alt="${hotel.hotel_name}" loading="lazy">
                </div>

                <div class="image-top-right-1">
                    <img src="${remainingImages[0]}" alt="${hotel.hotel_name}" loading="lazy">
                </div>

                <div class="image-top-right-2">
                    <img src="${remainingImages[1]}" alt="${hotel.hotel_name}" loading="lazy">
                </div>

                
                <div class="images-bottom-row">
                    ${restBottomImages_html}
                </div>
            </div>

            <div class="hotel-description">${hotel.hotel_description}</div>
            
            <div class="search-form-dashboard" id="searchFormDashboard"></div>

            <table id="bookingTable"></table>
        </div>

        <div class="reserve-confirmation" id="reserveConfirmation">
            <div class="confirmation-card">
                <h3>${t('confirmReservation')}</h3>
                <p id="reserveConfirmationText"></p>
                <div class="confirmation-actions">
                    <button id="reserveConfirmationBtn" class="btn-confirm">${t('confirmBtn')}</button>
                    <button id="reserveCancelBtn" class="btn-cancel">${t('cancelBtn')}</button>
                </div>
            </div>
        </div>

        <div class="toast-notification" id="toastNotification">
            <span id="toastMessage"></span>
        </div>


        <div class="modal-room" id="modalRoom"></div>
    `

    contentContainer.innerHTML = hotelDashboard_html;

    // ===========DASHBOARD SEARCH CHANGE RENDER==================
    hotel_dashboard_search(hotel.hotel_id)


     const response = await fetch(`${BASE_URL}/home/dashboard/rooms/${hotel.hotel_id}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': currentLang,
        }
    });

    const rooms_data = await response.json();
    render_booking_table(rooms_data)
}


function hotel_dashboard_search(hotel_id){
    const checkIn = document.getElementById('checkInInput').value;
    const checkOut = document.getElementById('checkOutInput').value;
    const haveCheckInAndCheckOut = (checkIn !== '' && checkOut !== '') ? true : false

    const guestsAmountInput = document.getElementById('guestsAmountInput').value;

    const dashboardSearch_html = `
        <h3 class="section-title">${t('availability')}</h3>

        ${!haveCheckInAndCheckOut ? `
            <div class="availability-alert">
                <span>${t('selectDatesAlert')}</span>
            </div>
        ` : ''}
        
        

        <div class="availability-box">
            <form class="change-search" id="changeSearch">
                <div class="search-field-wrapper date-field-wrapper">
                    <div class="inputs-inline-group">
                        <div class="date-input-block">
                            <label class="field-placeholder-label">${t('checkIn')}</label>
                            <input class="booking-native-input" value="${checkIn ? checkIn : ''}" type="date" id="changeCheckIn">
                        </div>
                        
                        <div class="date-input-block">
                            <label class="field-placeholder-label">${t('checkOut')}</label>
                            <input class="booking-native-input" value="${checkOut ? checkOut : ''}" type="date" id="changeCheckOut">
                        </div>
                    </div>
                </div>

                <div class="search-field-wrapper guests-field-wrapper">
                    <div class="date-input-block full-width">
                        <label class="field-placeholder-label">${t('selectOccupancy')}</label>
                        <input class="booking-native-input" type="number" value="${guestsAmountInput ? guestsAmountInput : 2}" id="changeGuestsAmount">
                    </div>
                </div>

                <button type="submit" class="booking-search-btn" id="bookingSearchBtn">
                    ${haveCheckInAndCheckOut ? `${t('changeSearch')}` : `${t('search')}`}
                </button>
            </form>
        </div>
    `
    // =====================
    const searchFormDashboard = document.getElementById('searchFormDashboard')
    searchFormDashboard.innerHTML = dashboardSearch_html;

    //===========SEARCH EVENT LISTENER========
    const changeSearch = document.getElementById('changeSearch');
    changeSearch.addEventListener('submit', async (event) => {
        event.preventDefault();

        const changeCheckIn = document.getElementById('changeCheckIn').value;
        const changeCheckOut = document.getElementById('changeCheckOut').value;
        const changeGuestsAmount = document.getElementById('changeGuestsAmount').value;

        if (changeCheckIn && changeCheckOut && changeGuestsAmount){
            // =======CHANGE MAIN SEARCH VALUES=====
            document.getElementById('checkInInput').value = changeCheckIn;
            document.getElementById('checkOutInput').value = changeCheckOut;
            document.getElementById('guestsAmountInput').value = changeGuestsAmount;
            

            const response = await fetch(`${BASE_URL}/home/dashboard/rooms/${hotel_id}/?checkIn=${changeCheckIn}&checkOut=${changeCheckOut}&guestsAmount=${changeGuestsAmount}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': currentLang,
                }
            });

            const rooms_data = await response.json();
            render_booking_table(rooms_data)
            hotel_dashboard_search(hotel_id)
        }
    })

}


function render_booking_table(rooms){
    const checkIn = document.getElementById('checkInInput').value;
    const checkOut = document.getElementById('checkOutInput').value;
    const haveCheckInAndCheckOut = (checkIn !== '' && checkOut !== '') ? true : false

    const amount_nights_milliseconds = new Date(checkOut) - new Date(checkIn)

    const amount_nights = amount_nights_milliseconds / (1000 * 60 * 60 * 24);

    let table_html = ''

    // =====IF CHECKIN N CHECKOUT========

    if (haveCheckInAndCheckOut){
        let tbody_html = ''
        
        // ========================
        rooms.forEach((room) => {
            // ========CONSTS==========
            const total_price = room.price_one_night * amount_nights
            const categoriesHtml = room.room_categories && room.room_categories.length > 0 ? room.room_categories.map(cat => `<p>${cat.name}</p>`).join('') : ''
            

            tbody_html += `
                <tr>
                    <td>
                        <div>
                            <a 
                            data-room-images='${JSON.stringify(room.room_images)}'
                            data-room-title="${room.room_title}"
                            data-room-description="${room.room_description}"
                            data-room-facilities='${JSON.stringify(room.room_facilities)}'
                            class="room-link">${room.room_title}</a>
                        </div>

                        <div>
                            Number of guests: ${room.max_guests_amount}
                        </div>

                        <div>
                            ${categoriesHtml}
                        </div>
                    </td>

                    <td>
                        ${total_price}
                    </td>

                    <td>
                        <select>
                            <option value="0">0</option>
                            <option value="1">1 ${total_price}</option>
                            <option value="2">2 ${total_price * 2}</option>
                            <option value="3">3 ${total_price * 3}</option>
                        </select>
                    </td>

                    <td>
                        <div class="reserve-sticky-container">
                            <button class="reserve-main-btn" 
                                data-room-title="${room.room_title}"
                                data-room-id="${room.room_id}" data-check-in="${checkIn}"
                                data-check-out="${checkOut}" data-nights-amount="${amount_nights}"
                                data-price="${total_price}">
                                I'll reserve
                            </button>
                            <span class="reserve-sub-text">You won't be charged yet</span>
                        </div>
                    </td>

                </tr>
            `
        })
        // ==================
        table_html = `
            <thead>
                <tr>
                    <th>${t('roomType')}</th>
                    <th>Price for ${amount_nights} ${t('priceForNights')}</th>
                    <th>${t('selectRoom')}</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>${tbody_html}</tbody>
        `
    }

    // ==========IF NOT CHECKIN N NOT CHECKOUT==========
    else{
        let tbody_html = ''
        
        // ========================
        rooms.forEach((room) => {
            // ========CONSTS==========
            const categoriesHtml = room.room_categories && room.room_categories.length > 0 ? room.room_categories.map(cat => `<p>${cat.name}</p>`).join('') : ''


            tbody_html += `
                <tr>
                    <td>
                        <div>
                            <a
                            data-room-images='${JSON.stringify(room.room_images)}'
                            data-room-title="${room.room_title}"
                            data-room-description="${room.room_description}"
                            data-room-facilities='${JSON.stringify(room.room_facilities)}'
                            class="room-link">${room.room_title}</a>
                        </div>

                        <div>
                            ${t('numberOfGuests')}: ${room.max_guests_amount}
                        </div>

                        <div>
                            ${categoriesHtml}
                        </div>

                    </td>

                    <td>
                        ${room.max_guests_amount}
                    </td>

                    <td>
                        <button>${t('showPrices')}</button>
                    </td>
                </tr>
            `
        })

        table_html = `
            <thead>
                <tr>
                    <th>${t('roomType')}</th>
                    <th>${t('numberOfGuests')}</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>${tbody_html}</tbody>
        `
    }
    // =======================
    const bookingTable = document.getElementById('bookingTable');
    bookingTable.innerHTML = table_html

    // ========MODAL OPEN EVENT LISTENER======
    render_room_modal()

    // =======RESERVE EVENT LISTENER===========
    reserve_room()
}


function render_room_modal(){
    const roomLinks = document.querySelectorAll('.room-link');
    const modalRoom = document.getElementById('modalRoom');

    modalRoom.innerHTML = `
        <div class="modal-content-wrapper">
            <button class="modal-close-btn" id="modalCloseBtn">&times;</button>

            <div class="room-imgs-container">
                <div class="room-img-carousel"></div>
                <div class="room-imgs-under-carousel"></div>
            </div>

            <div class="room-about-container">
                <h3 class="room-title"></h3>
                <p class="room-description"></p>
                <h3>${t('facilities')}</h3>
                <div class="room-facilities"></div>
            </div>
        </div>
    `

    roomLinks.forEach((room) => {

        room.addEventListener('click', () => {
            const roomImages = JSON.parse(room.dataset.roomImages);
            const roomFacilities = JSON.parse(room.dataset.roomFacilities);
            const roomTitle = room.dataset.roomTitle;
            const roomDescription = room.dataset.roomDescription;

            const modalRoomImagesCarousel = modalRoom.querySelector('.room-img-carousel');
            const modalRoomImages = modalRoom.querySelector('.room-imgs-under-carousel');
            const modalRoomDescription = modalRoom.querySelector('.room-description');
            const modalRoomFacilities = modalRoom.querySelector('.room-facilities');
            const modalRoomTitle = modalRoom.querySelector('.room-title');

            // ===============
            let htmlImgs = ''
            let htmlImgsUnder = ''
            let htmlFacilities = ''

            roomImages.forEach((image, index) => {
                htmlImgs += `<img src=${image} alt=${roomTitle} data-index=${index}>`
                htmlImgsUnder += `<img src=${image} alt=${roomTitle} data-index=${index} class="${index===0 ? 'active-thumb' : ''}">`
            })

            roomFacilities.forEach((facility) => {
                htmlFacilities += `
                    <div class="facility-item">
                        <div class="facility-icon">
                            ${facility.facility_svg}
                        </div>
                        <span class="facility-name">${facility.name}</span>
                    </div>
                `
            })

            // =============
            modalRoomImagesCarousel.innerHTML = htmlImgs;
            modalRoomImages.innerHTML = htmlImgs;
            modalRoomTitle.innerHTML = roomTitle;
            modalRoomDescription.innerHTML = roomDescription
            modalRoomFacilities.innerHTML = htmlFacilities

            // ========IMAGES SCROLL=========
            const thumbImages = modalRoomImages.querySelectorAll('img');
            const carouselImages = modalRoomImagesCarousel.querySelectorAll('img');

            thumbImages.forEach((thumb) => {
                thumb.addEventListener('click', (e) => {
                    const targetIndex = e.target.dataset.index;

                    thumbImages.forEach((img) => {
                        img.classList.remove('active-thumb');
                        e.target.classList.add('active-thumb');
                    })

                    const targetImg = carouselImages[targetIndex]
                    if (targetImg){
                        modalRoomImagesCarousel.scrollTo({
                            left: targetImg.offsetLeft - modalRoomImagesCarousel.offsetLeft,
                            behavior: 'smooth'
                        });
                    }
                });
            })

            // ===OPEN=====
            modalRoom.classList.add('active')
        })
        
    })
    document.getElementById('modalCloseBtn').addEventListener('click', () => {
        document.getElementById('modalRoom').classList.remove('active');
    });
}

function reserve_room(){
    const reserveBtns = document.querySelectorAll('.reserve-main-btn')
    reserveBtns.forEach((reserveBtn) => {
        reserveBtn.addEventListener('click', () => {
            const access_token = localStorage.getItem('access_token');
            if (!access_token){
                showToast(`${t('pleaseLogIn')}`, 'error')
            }
            // =====================================
            const checkIn = reserveBtn.dataset.checkIn;
            const checkOut = reserveBtn.dataset.checkOut;
            const roomId = reserveBtn.dataset.roomId;
            const roomTitle = reserveBtn.dataset.roomTitle;
            const roomNightsAmount = reserveBtn.dataset.nightsAmount;
            const roomPrice = reserveBtn.dataset.price;

            const row = reserveBtn.closest('tr');
            const select = row.querySelector('select')

            const roomsAmount = select.value;
            // ================================

            const reserveConfirmation = document.getElementById('reserveConfirmation');
            reserveConfirmation.classList.add('active');

            document.getElementById('reserveConfirmationText').innerHTML = t('reservationText',
                    roomTitle, 
                    roomNightsAmount, 
                    roomsAmount, 
                    roomPrice, 
                    checkIn, 
                    checkOut
                )
                
            


            // =============IF CONFIRM============
            const confirmBtn = document.getElementById('reserveConfirmationBtn');
            confirmBtn.addEventListener('click', async() => {
                try {
                    const response = await refresh_token(`${BASE_URL}/reserve/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            'check_in': checkIn,
                            'check_out': checkOut,
                            'rooms_amount': roomsAmount,
                            'room': roomId
                        })
                    })

                    const data = await response.json()

                    if (!response.ok){
                        console.log(data)
                        const reserveConfirmation = document.getElementById('reserveConfirmation');
                        reserveConfirmation.classList.remove('active');

                        const errorText = data.rooms_amount[0];
                        showToast(errorText)
                        return
                    }

                    // =========IF RESPONSE OK===========

                    const reserveConfirmation = document.getElementById('reserveConfirmation');
                    reserveConfirmation.classList.remove('active');
                    showToast(data.message || `${t('successSuccess')}`, 'success');

                } catch{
                    showToast(`${t('somethingWentWrong')}`)
                }

            }, {once: true});


            // =============IF CANCEL CONFIRM================
            const cancelConfirm = document.getElementById('reserveCancelBtn');
            cancelConfirm.addEventListener('click', () => {
                document.getElementById('reserveConfirmation').classList.remove('active');
            }, {once: true})

        })
    })
}




export function showToast(message, type = 'error') {
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');

    toastMsg.textContent = message;
    toast.className = `toast-notification ${type} active`

    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000)
}