import { BASE_URL } from '../../../base_url.js';
import { countries } from '../../../countries.js';
import { render_hotel_dashboard, showToast } from './propertyDashboard.js';
import { t } from '../../text_translation.js';



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


// =============AI CHAT BOT==============
function aiChatBot(){
    // ==========BTN OPEN CHAT==========
    const openAiChatBtn = document.getElementById('openAiChatBtn');
    openAiChatBtn.addEventListener('click', () => {
        const aiChatContainer = document.getElementById('aiChatContainer');
        aiChatContainer.classList.toggle('active')
    })
    // ==================================
    const aiChatBotForm = document.getElementById('aiChatBotForm');
    const aiChatBotInput = document.getElementById('aiChatBotInput');

    aiChatBotForm.addEventListener('submit', async(event) => {
        event.preventDefault();
        const userInput = aiChatBotInput.value.trim();
        if (!userInput) return

        appendMessage(userInput, 'user-message');

        const loadingId = appendMessage('bot-message loading...', 'bot-message loading');
        aiChatBotInput.value = ''

        try{
            const aiChatBotResponse = await fetch(`${BASE_URL}/api/chat-bot/`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    user_input: userInput
                })
            })

            if (!aiChatBotResponse.ok){
                console.log('AI CANNOT REPLY. ERROR')
                document.getElementById(loadingId)?.remove()
                appendMessage("Couldn't receive response from the server", 'bot-message error')
                return 
            }

            const data = await aiChatBotResponse.json()
            document.getElementById(loadingId)?.remove();

            if (data.ai_response){
                appendMessage(data.ai_response, 'bot-message');
            }else{
                appendMessage("Couldn't receive response", 'bot-message error');
            }
        } catch (error){
            document.getElementById(loadingId)?.remove();
            appendMessage('an error occured', 'bot-message error');
        }
    })
}


function appendMessage(text, className){
    const chatMessage = document.getElementById('chatMessage');
    const messageDiv = document.createElement('div')

    const messageId = 'msg-' + Date.now() + Math.random();

    messageDiv.id = messageId;
    messageDiv.className = `message ${className}`

    messageDiv.innerHTML = text.replace(/\n/g, '<br>');

    chatMessage.appendChild(messageDiv);

    chatMessage.scrollTop = chatMessage.scrollHeight;

    return messageId
    
}

aiChatBot()
// ======================================



// =========RENDER HOME PAGE FIRST RELOAD=========
render_home_page();

// ===========EVENT LISTENER FOR OPENING ROOM DASHBOARD======
function open_room_dashboard() {
    document.getElementById('hotelsContainer').addEventListener('click', async (event) => {
        const cardItem = event.target.closest('.hotel-card-item')
        const propertyCardId = cardItem.dataset.propertyId;
        const propertyType = cardItem.dataset.propertyType;
        const response_hotel = await fetch(`${BASE_URL}/home/dashboard/${propertyType}/?id=${propertyCardId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': currentLang,
            }
        })

        if (!response_hotel) {
            showToast(`${t('errorOccurred')}`)
        } else {
            const hotel = await response_hotel.json()
            render_hotel_dashboard(hotel)
        }


    })
}

// ==========================RENDER HOME PAGE=================================
async function render_home_page() {
    // ========START HTML==========
    starter_html()

    // =======IS AUTHENTICATED=======
    const access_token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username')
    const isAuthenticatedOrNotDiv = document.getElementById('isAuthenticatedOrNotDiv');
    if (access_token) {
        

        isAuthenticatedOrNotDiv.innerHTML = `
            <div class="user-profile-badge">
                <span class="welcome-text">${t('welcomeBack')}</span>
                <a href="/users/templates/user-profile.html">
                    <span class="username">${username}</span>
                </a>
                <span class="dropdown-arrow">&#9660<span>
            </div>
            <a class="logout-link" id="logoutBtn">${t('logOut')}</a>
        `

        // ==========LOG OUT EVENT LISTENER======
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('is_business');
            localStorage.removeItem('username');

            window.location.reload();
            
        })
    } else {
        isAuthenticatedOrNotDiv.innerHTML = `
            <a href="/users/templates/register.html">
                <button>${t('register')}</button>
            </a>

            <a href="/users/templates/login.html">
                <button>
                    ${t('signIn')}
                </button>
            </a>
        `
    }

    // --------RENDER CARDS----
    const response = await fetch(`${BASE_URL}/home/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': currentLang,
        }
    })

    const hotels = await response.json()
    await render_hotel_cards(hotels)

    // ============LIST PROPERTY LINK=========
    const listPropertyLink = document.getElementById('listPropertyLink');
    listPropertyLink.addEventListener('click', (event) => {
        const access_token = localStorage.getItem('access_token');
        const is_business = localStorage.getItem('is_business');

        if (is_business === 'false' || is_business === null){
            event.preventDefault();
            window.location.href = `/users/templates/register.html`
        }

        if (!access_token) {
            event.preventDefault();
            window.location.href = `/users/templates/login.html`
        }
    })
}

function starter_html() {
    const contentContainer = document.getElementById('contentContainer');

    // ============TRANSLATE STATIC TEXT===========
    document.getElementById('listPropertyLink').innerHTML = `${t('listproperty')}`

    // ========START HTML==========
    let start_html = `
        <div class="content-layout">
            <aside class="filters-container">
                <div class="filters-header">
                    <h2>${t('filterBy')}</h2>
                </div>
                <div class="filters-groups" id="filtersGroupsContainer"></div>
            </aside>

            <div id="hotelsContainer" class="hotels-container"></div>
            
        </div>
    `;

    // -----STARTER HTML FOR HOME PAGE-----
    contentContainer.innerHTML = start_html;
    render_filter_sidebar();
    open_room_dashboard();

}

// ==============SEARCH BAR=================
function render_search_html() {
    const searchForm = document.getElementById('searchForm');
    if (!searchForm) return;

    // =========COUNTRIES===========
    let datalistCountry_html = '';
    countries.forEach((country) => {
        datalistCountry_html += `
            <option value="${country.country_name}">${country.country_code}</option>
        `;
    });
    // ==============================

    searchForm.innerHTML = `
        <div>
            <label>${t('destination')}<label>
            <input type="text" list="country-list" placeholder="${t('destinationPlaceholder')}" id="countryInput">
            <datalist id="country-list">
                ${datalistCountry_html}
            </datalist>
        </div>

        <div>
            <div>
                <label>${t('checkInDate')}</label>
                <input type="date" placeholder="Select check-in date" id="checkInInput">
            </div>

            <div>
                <label>${t('checkOutDate')}</label>
                <input type="date" name="checkOut" placeholder="Select check-out date" id="checkOutInput">
            </div>
        </div>

        <div>
            <label>${t('selectGuests')}</label>
            <input type="number" name="guests_amount" id="guestsAmountInput" value="2">
        </div>

        <button type="submit" id="searchBtn">${t('submit')}</button>
    `;


    // ========FILTER LISTENERS=======
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const hotelsContainer = document.getElementById('hotelsContainer');
        if (!hotelsContainer){
            starter_html();
        }

        filter_cards()

    })
}
render_search_html();

// =============FILTER SIDEBAR================
async function render_filter_sidebar() {
    const response = await fetch(`${BASE_URL}/home/filters/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': currentLang,
        }
    });

    if (!response.ok) {
        showToast(`${t('errorLoadingFilters')}`)
        return;
    }

    const filters_group = await response.json();
    let filter_html = '';

    // =========FILTER SIDEBAR HTML=============
    for (const [category, group] of Object.entries(filters_group)) {
        let filterOptions = '';

        for (const object of group) {
            filterOptions += `
                <label class="filter-label">
                    <input class="filterCheckBox" type="checkbox" name="${category}" value="${object}">
                    <span class="checkbox-text">${object}</span>
                </label>
            `;
        }

        filter_html += `
            <div class="filter-section">
                <h3 class="filter-group-title">${category}</h3>
                <div class="filter-options">
                    ${filterOptions}
                </div>
            </div>
        `;
    }

    // ======================
    const container = document.getElementById('filtersGroupsContainer');
    if (container) {
        container.innerHTML = filter_html

        // ========EVENT LISTENER=====
        document.querySelectorAll('.filterCheckBox').forEach((checkBox) => {
            checkBox.addEventListener('change', () => {
                filter_cards();
            });
        });
    }
}

// =============RENDER HOTEL CARDS================
async function render_hotel_cards(hotels) {
    const hotelsContainer = document.getElementById('hotelsContainer');
    let hotels_html = ''

    hotels.forEach((hotel) => {
        hotels_html += `
            <a class="hotel-card-item" data-property-id="${hotel.hotel_id}" data-property-type="hotel">
                <div class="hotel-card-img">
                    <img src="${hotel.image}" alt="${hotel.hotel_name}" loading="lazy">
                </div>

                <div class="hotel-card-info">
                    <h3 class="hotel-name">${hotel.hotel_name}</h3>
                    <p class="hotel-location">${hotel.city}, ${hotel.country}</p>
                </div>

                <div class="hotel-card-action">
                    <button class="availability-btn">${t('selectDates')}</button>
                </div>
            </a>
    `
    })

    hotelsContainer.innerHTML = hotels_html
}


// ============FILTER==============
async function filter_cards() {
    const country = document.getElementById('countryInput').value;
    const checkIn = document.getElementById('checkInInput').value;
    const checkOut = document.getElementById('checkOutInput').value;
    const guestsAmount = document.getElementById('guestsAmountInput').value;
    const checkedBoxes = document.querySelectorAll('.filterCheckBox:checked');

    

    // ========IF NO FILTER =>>> RENDER HOTELS===========
    if (!country && !checkIn && !checkOut && checkedBoxes.length === 0) {
        const response = await fetch(`${BASE_URL}/home/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': currentLang,
            }
        });

        if (response.ok) {
            const hotels = await response.json()
            render_hotel_cards(hotels)
        }

        return
    }
    // ============================
    const params = new URLSearchParams();

    checkedBoxes.forEach((checkBox) => {
        params.append(checkBox.name, checkBox.value);
    })

    country ? params.append('country', country) : ''
    checkIn ? params.append('checkIn', checkIn) : ''
    checkOut ? params.append('checkOut', checkOut) : ''
    guestsAmount ? params.append('max_guests_amount', guestsAmount) : ''

    const queryString = params.toString();
    const url = `${BASE_URL}/home/filter/rooms/?${queryString}`

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': currentLang,
        }
    })

    if (!response.ok) {
        showToast('ERROR loading filters')
        return
    }


    const rooms = await response.json();

    render_room_cards(rooms);

}

// ===============RENDER FILTERED ROOM CARDS===========
function render_room_cards(rooms) {
    const hotelsContainer = document.getElementById('hotelsContainer');
    let rooms_html = ''

    rooms.forEach((room) => {
        rooms_html += `
            <a class="hotel-card-item" data-property-id="${room.room_id}" data-property-type="room">
                <div class="hotel-card-img">
                    <img src="${room.image}" alt="${room.room_title}" loading="lazy">
                </div>

                <div class="hotel-card-info">
                    <h3 class="hotel-name">${room.hotel_name}</h3>
                    <p class="room-title">${room.room_title}</p>
                    <p class="hotel-location">${room.city}, ${room.country}</p>
                </div>

                <div class="hotel-card-action">
                    <button class="availability-btn">Select dates</button>
                </div>
            </a>
    `
    });

    hotelsContainer.innerHTML = rooms_html
}





// ===========EVENT LISTENERS FOR LINKS========
const bookingComLink = document.getElementById('bookingComLink');

bookingComLink.addEventListener('click', async (event) => {
    event.preventDefault();
    await render_home_page();
    filter_cards();
})