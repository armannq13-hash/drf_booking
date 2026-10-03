import django
import os
from dotenv import load_dotenv

load_dotenv()

project_folder = os.getenv('DJANGO_PROJECT_FOLDER')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", f'{project_folder}.settings')
django.setup()
# ================================

from bookings.models import Booking
import schedule
import time
from datetime import date, timedelta
from django.core.mail import send_mail


def check_out_checker():
    print('Running check_out checking across the database')
    
    # ======CHECKING LOGIC=======
    bookings = Booking.objects.filter(status='active')
    today = date.today()
    
    for booking in bookings:
        if today > booking.check_out:
            booking.status = 'checked_out'
            booking.save()
            
# =========================================
email_host = os.getenv('EMAIL_HOST_USER')
def day_left_checker():
    print('Running one day left checking across the database')
    
    # =====CHECKING LOGIC=========
    today = date.today()
    notify_day_one_left = today + timedelta(days=1)
    notify_day_week_left = today + timedelta(days=7)
    
    upcoming_bookings_tomorrow = Booking.objects.filter(check_in=notify_day_one_left).select_related(
        'user', 'room', 'room__hotel'
    )
    
    upcomming_bookings_week = Booking.objects.filter(check_in=notify_day_week_left).select_related(
        'user', 'room', 'room__hotel'
    )
    
    try:
        for booking in upcoming_bookings_tomorrow:
            message = (
            f'Dear {booking.user.username},\n\n'
            f'This is a friendly reminder that your reservation at '
            f'{booking.room.hotel.hotel_name} ({booking.room.room_title}) begins tomorrow.\n\n'
            f'Check-in: {booking.check_in}\n'
            f'Check-out: {booking.check_out}\n\n'
            f'We wish you a pleasant stay. If you need to change or cancel your '
            f'reservation, please do so through your account.\n\n'
            f'Kind regards,\n'
            f'The Booking Team'
        )
            
            send_mail(
                subject = 'Reservation notification',
                message= message,
                from_email=email_host,
                recipient_list=[booking.user.email]
            )
            
        for booking in upcomming_bookings_week:
            message = (
                f'Dear {booking.user.username},\n\n'
                f'This is a friendly reminder that your reservation at '
                f'{booking.room.hotel.hotel_name} ({booking.room.room_title}) begins in 7 days.\n\n'
                f'Check-in: {booking.check_in}\n'
                f'Check-out: {booking.check_out}\n\n'
                f'We wish you a pleasant stay. If you need to change or cancel your '
                f'reservation, please do so through your account.\n\n'
                f'Kind regards,\n'
                f'The Booking Team'
            )
            
            send_mail(
                subject = 'Reservation notification',
                message= message,
                from_email=email_host,
                recipient_list=[booking.user.email]
            )

    except Exception as e:
        print(f'ERROR WHILE SENDING EMAIL: {e}')
            
            
schedule.every().day.at("10:00").do(check_out_checker)
schedule.every().day.at("10:00").do(day_left_checker)


while True:
    print('checking')
    schedule.run_pending()
    time.sleep(60)