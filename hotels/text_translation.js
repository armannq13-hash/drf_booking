export const text_translations = {
    en: {
        welcomeBack: "Welcome back,",
        listproperty: "List your property",
        logOut: "Log out",
        register: "Register",
        signIn: "Sign in",
        filterBy: "Filter by:",
        destination: "Enter your destination",
        destinationPlaceholder: "Where are you going?",
        checkInDate: "Check in date:",
        checkOutDate: "Check out date:",
        selectGuests: "Select number of guests",
        submit: "Submit",
        selectDates: "Select dates",
        errorOccurred: "An error occurred",
        errorLoadingFilters: "ERROR loading filters",


        // =====DASHBOARD=====
        photosCount: 'photos',
        availability: "Availability",
        selectDatesAlert: "Select dates to see this property's availability and prices",
        checkIn: "Check-in",
        checkOut: "Check-out",
        selectOccupancy: "Select occupancy",
        changeSearch: "Change search",
        search: "Search",
        roomType: "Room type",
        priceForNights: 'nights',
        selectRoom: "Select a room",
        numberOfGuests: "Number of guests",
        showPrices: "Show prices",
        facilities: "Facilities",
        confirmReservation: "Confirm your reservation",
        confirmBtn: "Confirm",
        cancelBtn: "Cancel",
        pleaseLogIn: "Please, log in",
        successSuccess: "Success!",
        somethingWentWrong: "Something went wrong",
        reservationText: (title, nights, amount, price, checkIn, checkOut) => 
            `Are you sure you want to reserve ${title} for ${nights} nights? Amount of rooms: ${amount}, Price: $${price} from ${checkIn} to ${checkOut}`
    },
    ru: {
        welcomeBack: "С возвращением,",
        listproperty: "Разместить объект",
        logOut: "Выйти",
        register: "Регистрация",
        signIn: "Войти",
        filterBy: "Фильтровать по:",
        destination: "Введите пункт назначения",
        destinationPlaceholder: "Куда вы направляетесь?",
        checkInDate: "Дата заезда:",
        checkOutDate: "Дата выезда:",
        selectGuests: "Выберите количество гостей",
        submit: "Найти",
        selectDates: "Выбрать даты",
        errorOccurred: "Произошла ошибка",
        errorLoadingFilters: "Ошибка загрузки фильтров",

        // =====DASHBOARD=====
        photosCount: 'фото',
        availability: "Доступность",
        selectDatesAlert: "Выберите даты, чтобы посмотреть доступность и цены этого объекта",
        checkIn: "Заезд",
        checkOut: "Выезд",
        selectOccupancy: "Количество гостей",
        changeSearch: "Изменить поиск",
        search: "Найти",
        roomType: "Тип номера",
        priceForNights: (nights) => `Цена за ${nights} ноч.`,
        selectRoom: "Выберите номер",
        numberOfGuests: "Количество гостей",
        showPrices: "Показать цены",
        facilities: "Удобства",
        confirmReservation: "Подтвердите бронирование",
        confirmBtn: "Подтвердить",
        cancelBtn: "Отмена",
        pleaseLogIn: "Пожалуйста, войдите в систему",
        successSuccess: "Успешно!",
        somethingWentWrong: "Что-то пошло не так",
        reservationText: (title, nights, amount, price, checkIn, checkOut) => 
            `Вы уверены, что хотите забронировать «${title}» на ${nights} ноч.? Количество номеров: ${amount}, Цена: $${price} с ${checkIn} по ${checkOut}`
    },
    kk: {
        welcomeBack: "Қош келдіңіз,",
        listproperty: "Нысанды орналастыру",
        logOut: "Шығу",
        register: "Тіркелу",
        signIn: "Кіру",
        filterBy: "Фильтр:",
        destination: "Бағытыңызды таңдаңыз",
        destinationPlaceholder: "Қайда барасыз?",
        checkInDate: "Келу күні:",
        checkOutDate: "Шығу күні:",
        selectGuests: "Қонақтар санын таңдаңыз",
        submit: "Іздеу",
        selectDates: "Күндерді таңдау",
        errorOccurred: "Қате орын алды",
        errorLoadingFilters: "Фильтрлерді жүктеу қатесі",



        // =====DASHBOARD=====
        photosCount: 'фото',
        availability: "Бөлмелердің қолжетімділігі",
        selectDatesAlert: "Осы орынның қолжетімділігі мен бағаларын көру үшін күндерді таңдаңыз",
        checkIn: "Келу күні",
        checkOut: "Шығу күні",
        selectOccupancy: "Қонақтар саны",
        changeSearch: "Іздеуді өзгерту",
        search: "Іздеу",
        roomType: "Бөлме түрі",
        priceForNights: (nights) => `${nights} түнге бағасы`,
        selectRoom: "Бөлмені таңдаңыз",
        numberOfGuests: "Қонақтар саны",
        showPrices: "Бағасын көру",
        facilities: "Құрал-жабдықтар / Қызметтер",
        confirmReservation: "Брондауды растаңыз",
        confirmBtn: "Растау",
        cancelBtn: "Болдырмау",
        pleaseLogIn: "Жүйеге кіріңіз",
        successSuccess: "Сәтті!",
        somethingWentWrong: "Қате орын алды",
        reservationText: (title, nights, amount, price, checkIn, checkOut) => 
            `Сіз "${title}" бөлмесін ${nights} түнге брондағыңыз келетініне сенімдісіз бе? Бөлме саны: ${amount}, Бағасы: $${price}, келу күні: ${checkIn}, кету күні: ${checkOut}`
    }
};

export function t(key, ...args) {
    const lang = localStorage.getItem('user_language') || 'en';
    const parameter = text_translations[lang][key] || text_translations['en'][key]

    if (typeof parameter === 'function'){
        return parameter(...args)
    }

    return parameter
}



