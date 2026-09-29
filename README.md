# drf_booking
Full-stack Booking.com clone built with Django REST Framework & JS. Features 3-language auto-translation via DeepL, SimpleJWT auth, advanced hotel filtering, reservation management, and a custom admin dashboard.


# Booking.com Clone (DRF + Vanilla JS)

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Django REST Framework](https://img.shields.io/badge/Django_REST_Framework-3.14+-red?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![JWT](https://img.shields.io/badge/Authentication-SimpleJWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://django-rest-framework-simplejwt.readthedocs.io/)
[![DeepL API](https://img.shields.io/badge/Translation-DeepL_API-0F2B46?style=for-the-badge&logo=deepl&logoColor=white)](https://www.deepl.com/pro-api)

A full-stack accommodation reservation engine replicating core Booking.com workflows. Built with Django REST Framework on the backend and JavaScript on the frontend, featuring real-time 3-language auto-translation, token-based authentication, and dynamic filtering.

---

## Key Features

* **Authentication & Authorization:** Secure user registration, login, and token refresh using `SimpleJWT`.
* **Automated 3-Language Translation:** Dynamic translation of hotel details and descriptions using integrated **DeepL API**.
* **Advanced Hotel Search & Filtering:** Filter listings by availability, pricing, amenities, room types, and locations.
* **Reservation System:** Complete booking logic with date-overlap validation and status tracking.
* **Custom Admin Dashboard:** Tailored administration interface for managing users, properties, room inventories, and bookings.
* **Media & Image Management:** Multi-image uploads for hotel rooms and properties.

---

## 🛠️ Tech Stack

* **Backend:** Python, Django, Django REST Framework (DRF)
* **Frontend:** JavaScript (ES6+), HTML5, CSS3
* **Authentication:** JSON Web Tokens (`djangorestframework-simplejwt`)
* **Integrations:** DeepL API (Localization & Auto-Translation)
* **Database:** SQLite (Development) / PostgreSQL (Production ready)

---

## 📋 API Endpoints Overview

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/register/` | `POST` | Create new user account | No |
| `/api/token/` | `POST` | Obtain JWT token pair | No |
| `/home/filter/rooms/` | `GET` | Fetch rooms listings with filtering | No |
| `/reserve/` | `POST` | Reserve room dates | Yes (JWT) |
| `/api/chat-bot/` | `POST` | AI tour agent response | No |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* Python 3.10+
* Virtual environment tool (`venv` or `virtualenv`)

### Setup Instructions

1. **Clone the repository:**  
   `git clone https://github.com/armannq13-hash/drf_booking.git`  
   `cd drf_booking`

2. **Create and activate a virtual environment:**  
   `python -m venv venv`  
   `source venv/bin/activate` *(On Windows: `venv\Scripts\activate`)*

3. **Install dependencies:**  
   `pip install -r requirements.txt`

4. **Configure Environment Variables & CORS:**  
   Create a `.env` file in the root directory:  
   `SECRET_KEY=your_django_secret_key`  
   `DEBUG=True/False`  
   `DEEPL_API_KEY=your_deepl_api_key (you can get it in deepl.com)`    
   `DATABASE_PATH=your_database_absolute_path`    
   `GEMINI_API_KEY=your_gemini_api_key (you can get a free one on https://ai.google.dev/gemini-api/docs/api-key)`
   `GEMINI_MODEL=gemini_model_you_use`    
   Ensure your frontend origin is added to `CORS_ALLOWED_ORIGINS` in Django settings (e.g., `http://localhost:5500` or `http://127.0.0.1:5500`).

6. **Configure Frontend Base URL:**  
   Update `base_url.js` with your backend server URL .

7. **Apply Database Migrations:**  
   `python manage.py migrate`

8. **Run the Development Server:**  
   `python manage.py runserver`  
   Access the API locally at `http://127.0.0.1:8000/`.
