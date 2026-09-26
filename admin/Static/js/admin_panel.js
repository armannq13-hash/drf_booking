import { render_hotel_dashboard } from "./render_hotel.js";
import { render_rooms_dashboard } from "./render_room.js";
import { render_reservations_dashboard } from "./render_reservations.js";

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

// ----------------EVENT LISTENERS FOR SIDEBAR--------------------
document.getElementById('sidebarHotels').addEventListener('click', () => {
    render_hotel_dashboard();
})

document.getElementById('sidebarRooms').addEventListener('click', () => {
    render_rooms_dashboard();
})

document.getElementById('sidebarBookings').addEventListener('click', () => {
    render_reservations_dashboard();
})

// ---------------INITIAL RENDER---------------------
render_hotel_dashboard()


export function confirmBeforeAction(message, afterConfirmFunction){
    const confirmTablet = document.getElementById('confirmationTablet');
    const confirmationText = document.getElementById('confirmationText');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');

    confirmationText.textContent = message
    confirmTablet.classList.add('active');

    cancelConfirmBtn.addEventListener('click', () => {
        confirmTablet.classList.remove('active');
    }, {once: true});

    confirmBtn.addEventListener('click', () => {
        afterConfirmFunction();
        confirmTablet.classList.remove('active')
    }, {once: true})
}




