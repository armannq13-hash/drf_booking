import django
import os
from dotenv import load_dotenv

load_dotenv()

project_folder = os.getenv('DJANGO_PROJECT_FOLDER')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", f'{project_folder}.settings')
django.setup()

from bookings.models import Booking
import schedule
import time
from datetime import date

def check_out_checker():
    print('Running check_out checking across the database')
    
    # ======CHECKING LOGIC=======
    bookings = Booking.objects.filter(status='active')
    today = date.today()
    
    for booking in bookings:
        if today > booking.check_out:
            booking.status = 'checked_out'
            booking.save()
            
            
# schedule.every().day.at("10:41").do(check_out_checker)

schedule.every(1).minutes.do(check_out_checker)


while True:
    print('checking')
    schedule.run_pending()
    time.sleep(60)