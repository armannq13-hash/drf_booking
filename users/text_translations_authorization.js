export const text_translations = {
    en: {
        // ... (previous keys)

        // Login & Register Pages
        loginTitle: "Login",
        registerTitle: "Register",
        signInOrCreate: "Sign in or create a new account",
        username: "Username",
        password: "Password",
        passwordConfirmation: "Password confirmation",
        phoneNumber: "Phone number",
        enterUsername: "Enter your username",
        enterPassword: "Enter your password",
        confirmPasswordPlaceholder: "Confirm your password",
        yourPhoneNumber: "Your phone number",
        signIn: "Sign in",
        register: "Register",
        notRegisteredYet: "Haven't registered yet?",
        alreadySignedIn: "Already signed in?",
        createBusinessAccount: "Create a business account?",
        fillAllFields: "Please fill all fields"

    },
    ru: {
        // ... (previous keys)

        // Login & Register Pages
        loginTitle: "Вход",
        registerTitle: "Регистрация",
        signInOrCreate: "Войдите или создайте аккаунт",
        username: "Имя пользователя",
        password: "Пароль",
        passwordConfirmation: "Подтверждение пароля",
        phoneNumber: "Номер телефона",
        enterUsername: "Введите имя пользователя",
        enterPassword: "Введите ваш пароль",
        confirmPasswordPlaceholder: "Подтвердите ваш пароль",
        yourPhoneNumber: "Ваш номер телефона",
        signIn: "Войти",
        register: "Зарегистрироваться",
        notRegisteredYet: "Еще не зарегистрированы?",
        alreadySignedIn: "Уже есть аккаунт?",
        createBusinessAccount: "Создать бизнес-аккаунт?",
        fillAllFields: "Пожалуйста, заполните все поля"
    },
    kk: {
        // ... (previous keys)

        // Login & Register Pages
        loginTitle: "Киру",
        registerTitle: "Тіркелу",
        signInOrCreate: "Жүйеге кіріңіз немесе жаңа аккаунт жасаңыз",
        username: "Пайдаланушы аты",
        password: "Құпия сөз",
        passwordConfirmation: "Құпия сөзді растау",
        phoneNumber: "Телефон нөмірі",
        enterUsername: "Пайдаланушы атын енгізіңіз",
        enterPassword: "Құпия сөзіңізді енгізіңіз",
        confirmPasswordPlaceholder: "Құпия сөзді растаңыз",
        yourPhoneNumber: "Сіздің телефон нөміріңіз",
        signIn: "Кіру",
        register: "Тіркелу",
        notRegisteredYet: "Әлі тіркелген жоқсыз ба?",
        alreadySignedIn: "Аккаунтыңыз бар ма?",
        createBusinessAccount: "Бизнес аккаунт ашу?",
        fillAllFields: "Барлық ұяшықтарды толтыруыңызды сұраймыз"
    }
};

export function t(key) {
    const lang = localStorage.getItem('user_language') || 'en';
    const translation = text_translations[lang][key] || text_translations['en'][key];
    
    return translation || key;
}
