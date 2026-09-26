export const text_translations = {
    en: {        
        // Navigation & Header
        listYourProperty: "List your property",
        yourAccount: "Your account",
        myBookings: "My bookings",
        myData: "My data",
        settings: "Settings",
        logOut: "Log out",
        confirmOrCancel: "Confirm or Cancel",
        confirmYes: "Confirm",
        cancelNo: "Cancel",
        cancelBooking: 'Cancel',

        // User Profile & Bookings Section
        myActiveBookings: "My active bookings",
        myCancelledBookings: "My cancelled bookings",
        noActiveBookings: "No active bookings found",
        noCancelledBookings: "No cancelled bookings found",
        checkIn: "Check-in:",
        checkOut: "Check-out:",
        nightsCount: 'nights',
        showAll: 'Show all',
        collapse: "Collapse",
        cancelBookingConfirm: "Do you want to cancel this booking?",
        cancelBookingSuccess: "Booking cancelled successfully",
        cancelBookingError: "Error cancelling booking"
    },
    ru: {
        // ... (previous keys)

        // Navigation & Header
        listYourProperty: "Зарегистрировать свой объект",
        yourAccount: "Ваш аккаунт",
        myBookings: "Мои бронирования",
        myData: "Мои данные",
        settings: "Настройки",
        logOut: "Выйти",
        confirmOrCancel: "Подтверждение или отмена",
        confirmYes: "Подтвердить",
        cancelNo: "Отмена",
        cancelBooking: 'Отменить',

        // User Profile & Bookings Section
        myActiveBookings: "Мои активные бронирования",
        myCancelledBookings: "Мои отмененные бронирования",
        noActiveBookings: "Активные бронирования не найдены",
        noCancelledBookings: "Отмененные бронирования не найдены",
        checkIn: "Заезд:",
        checkOut: "Выезд:",
        nightsCount:  'ночей',
        showAll: 'Показать все',
        collapse: "Свернуть",
        cancelBookingConfirm: "Вы хотите отменить это бронирование?",
        cancelBookingSuccess: "Бронирование успешно отменено",
        cancelBookingError: "Ошибка при отмене бронирования"
    },
    kk: {
        // ... (previous keys)

        // Navigation & Header
        listYourProperty: "Өз қонақ үйінді тіркеу",
        yourAccount: "Сіздің аккаунтыңыз",
        myBookings: "Менің брондауларым",
        myData: "Жеке деректер",
        settings: "Баптаулар",
        logOut: "Шығу",
        confirmOrCancel: "Растау немесе Болдырмау",
        confirmYes: "Иә",
        cancelNo: "Жоқ",
        cancelBooking: 'Бас тарту',

        // User Profile & Bookings Section
        myActiveBookings: "Менің белсенді брондауларым",
        myCancelledBookings: "Менің бас тартылған брондауларым",
        noActiveBookings: "Белсенді брондаулар табылмады",
        noCancelledBookings: "Бас тартылған брондаулар табылмады",
        checkIn: "Кіру:",
        checkOut: "Шығу:",
        nightsCount: 'түн',
        showAll: 'Барлығын көрсету',
        collapse: "Жинау",
        cancelBookingConfirm: "Бұл брондаудан бас тартқыңыз келе ме?",
        cancelBookingSuccess: "Брондау сәтті тоқтатылды",
        cancelBookingError: "Брондауды тоқтату қатесі"
    }
};


export function t(key){
    const lang = localStorage.getItem('user_language') || 'en';
    const translation = text_translations[lang][key] || text_translations['en'][key]

    return translation || key
}