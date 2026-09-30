import { showToast } from "../../../hotels/Static/js/propertyDashboard.js";
import { refresh_token } from "../../../refresh_token.js";
import { BASE_URL } from "../../../base_url.js";
import { t } from "../../text_translations_user_profile.js";


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


document.addEventListener('DOMContentLoaded', () => {
    render_user_profile_page();
});

async function render_user_profile_page() {
    try {
        const response = await refresh_token(`${BASE_URL}/reserve/api/user_profile/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            showToast('Something went wrong')
            return;
        }

        const data = await response.json();
        const active_bookings = data.active_bookings || [];
        const cancelled_bookings = data.cancelled_bookings || [];
        const checkedOut_bookings = data.checkedOut_bookings || [];

        let html_active = '';
        let html_cancelled = '';
        let html_checkedOut = '';


        // ===========ACTIVE BOOKINGS===========
        active_bookings.forEach((booking, index) => {
            const isHidden = index >= 3 ? 'hidden' : ''; 
            html_active += `
                <div class="booking-card ${isHidden}">
                    <img src="${booking.hotel_img}" alt="${booking.hotel_name}">
                    <div class="booking-details">
                        <div class="hotel-name">${booking.hotel_name}</div>
                        <div class="room-type">${booking.room_title}</div>
                        <div class="location">${booking.city}, ${booking.country}</div>
                        <div class="dates-info">${t('checkIn')} ${booking.check_in} &mdash; ${t('checkOut')} ${booking.check_out}</div>
                        <div class="booking-status status-active">${booking.status}</div>
                    </div>
                    <div class="booking-price">
                        <div class="price-value">$${booking.price}</div>
                        <div style="color: #666; font-size: 12px;">${booking.amount_nights} nights</div>
                        <button class="cancel-button" data-booking-id="${booking.booking_id}">${t('cancelBooking')}</button>
                    </div>
                </div>
            `;
        });

        if (active_bookings.length > 3) {
            html_active += `
                <a class="toggle-booking-btn">
                    <span class="btn-text">${t('showAll')} (${active_bookings.length - 3})</span>
                    <span class="arrow">&#9660;</span>
                </a>
            `;
        }

       
        // ==========CANCELLED BOOKINGS=========
        cancelled_bookings.forEach((booking, index) => {
            const isHidden = index >= 3 ? 'hidden' : '';
            html_cancelled += `
                <div class="booking-card ${isHidden}">
                    <img src="${booking.hotel_img}" alt="${booking.hotel_name}">
                    <div class="booking-details">
                        <div class="hotel-name">${booking.hotel_name}</div>
                        <div class="room-type">${booking.room_title}</div>
                        <div class="location">${booking.city}, ${booking.country}</div>
                        <div class="dates-info">${t('checkIn')} ${booking.check_in} &mdash; ${t('checkOut')} ${booking.check_out}</div>
                        <div class="booking-status status-cancelled">${booking.status}</div>
                    </div>
                    <div class="booking-price">
                        <div class="price-value">$${booking.price}</div>
                        <div style="color: #666; font-size: 12px;">${booking.amount_nights} ${t('nightsCount')}</div>
                    </div>
                </div>
            `;
        });

        if (cancelled_bookings.length > 3) {
            html_cancelled += `
                <a class="toggle-booking-btn">
                    <span class="btn-text">${t('showAll')} (${cancelled_bookings.length - 3})</span>
                    <span class="arrow">&#9660;</span>
                </a>
            `;
        }

        // ===========CHECKED OUT BOOKINGS=========
        checkedOut_bookings.forEach((booking, index) => {
            const isHidden = index >= 3 ? 'hidden' : '';
            html_checkedOut += `
                <div class="booking-card ${isHidden}">
                    <img src="${booking.hotel_img}" alt="${booking.hotel_name}">
                    <div class="booking-details">
                        <div class="hotel-name">${booking.hotel_name}</div>
                        <div class="room-type">${booking.room_title}</div>
                        <div class="location">${booking.city}, ${booking.country}</div>
                        <div class="dates-info">${t('checkIn')} ${booking.check_in} &mdash; ${t('checkOut')} ${booking.check_out}</div>
                        <div class="booking-status status-checkedOut">${booking.status}</div>
                    </div>
                    <div class="booking-price">
                        <div class="price-value">$${booking.price}</div>
                        <div style="color: #666; font-size: 12px;">${booking.amount_nights} ${t('nightsCount')}</div>
                    </div>
                </div>
            `;
        });

        if (checkedOut_bookings.length > 3) {
            html_cancelled += `
                <a class="toggle-booking-btn">
                    <span class="btn-text">${t('showAll')} (${checkedOut_bookings.length - 3})</span>
                    <span class="arrow">&#9660;</span>
                </a>
            `;
        }



        const no_active = active_bookings.length <= 0 ? `<p>${t('noActiveBookings')}</p>` : '';
        const no_cancelled = cancelled_bookings.length <= 0 ? `<p>${t('noCancelledBookings')}</p>` : '';
        const no_checkedOut = checkedOut_bookings.length <=0 ? `<p>${t('noCheckedOutBookings')}</p>` : '';

        
        document.getElementById('content').innerHTML = `
            <h1 class="content-title">${t('myActiveBookings')}</h1>
            ${no_active}
            <div class="booking-section">${html_active}</div><br><br>


            <h1 class="content-title">${t('myCancelledBookings')}</h1>
            ${no_cancelled}
            <div class="booking-section">${html_cancelled}</div><br>

            <h1 class="content-title">${t('myCheckedOutBookings')}</h1>
            ${no_checkedOut}
            <div class="booking-section">${html_checkedOut}</div>

        `;

        
        BookingInteractions();

    } catch (error) {
        console.error(`${t('cancelBookingError')}`, error);
    }
}

function BookingInteractions() {
    const modal = document.getElementById('reserveCancelConfirmation');
    const cancelConfirmBtn = document.getElementById('reserveCancelConfirmationBtn');
    const cancelDismissBtn = document.getElementById('reserveCancelCancelBtn');
    
    let currentBookingId = null;

    
    document.querySelectorAll('.cancel-button').forEach((cancelBtn) => {
        cancelBtn.addEventListener('click', (e) => {
            currentBookingId = e.currentTarget.dataset.bookingId;
            document.getElementById('reserveCancelConfirmationText').textContent = `${t('cancelBookingConfirm')}`;
            modal.classList.add('active');
        });
    });

    
    if (cancelDismissBtn) {
        cancelDismissBtn.onclick = () => {
            modal.classList.remove('active');
            currentBookingId = null;
        };
    }

    
    cancelConfirmBtn.onclick = async () => {
        if (!currentBookingId) return;

        try {
            
            const response = await refresh_token(`${BASE_URL}/reserve/api/user_profile/`, {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'booking_id': currentBookingId
                })
            });

            const data = await response.json();
            modal.classList.remove('active');

            if (!response.ok) {
                showToast(data.message || `${t('cancelBookingError')}`);
            } else {
                showToast(data.message || `${t('cancelBookingSuccess')}`, 'success');
                
                await render_user_profile_page();
            }
        } catch (error) {
            console.error('Error during cancellation:', error);
            modal.classList.remove('active');
            showToast('Something went wrong');
        }
    };


    document.querySelectorAll('.toggle-booking-btn').forEach((toggleBtn) => {
        toggleBtn.addEventListener('click', () => {
            const section = toggleBtn.closest('.booking-section');
            const cards = section.querySelectorAll('.booking-card');
            
            const isHidden = cards[3]?.classList.contains('hidden');
            const textSpan = toggleBtn.querySelector('.btn-text');

            cards.forEach((card, index) => {
                if (index >= 3) { 
                    if (isHidden) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                }
            });

            if (isHidden) {
                textSpan.textContent = `${t('collapse')}`;
                toggleBtn.classList.add('expanded');
            } else {
                textSpan.textContent = `${t('showAll')} (${cards.length - 3})`;
                toggleBtn.classList.remove('expanded');
            }
        });
    });
}



// ============TRANSLATE STATIC TEXT===
document.getElementById('listPropertyLink').innerHTML = `${t('listYourProperty')}`
document.getElementById('sidebarTitle').innerHTML = `${t('yourAccount')}`
document.getElementById('myBookingsNav').innerHTML = `${t('myBookings')}`
document.getElementById('myDataNav').innerHTML = `${t('myData')}`
document.getElementById('SettingsNav').innerHTML = `${t('settings')}`
document.getElementById('LogOutNav').innerHTML = `${t('logOut')}`
document.getElementById('confirmOrCancel').innerHTML = `${t('confirmOrCancel')}`
document.getElementById('reserveCancelConfirmationBtn').innerHTML = `${t('confirmYes')}`
document.getElementById('reserveCancelCancelBtn').innerHTML = `${t('cancelNo')}`


