from django.db import models
from users.models import CustomUser
from hotels.models import RoomType

# Create your models here.
class Booking(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, blank=True, null=True)
    room = models.ForeignKey(RoomType, on_delete=models.SET_NULL, blank=True, null=True)
    
    check_in = models.DateField()
    check_out = models.DateField()
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('checked_out', 'Checked Out'),
    ]
    
    status = models.CharField(choices=STATUS_CHOICES, default='active')
    
    def __str__(self):
        return f"{self.check_in}––{self.check_out} | {self.user.username if self.user.username else 'deleted_user'} | {self.room.room_title} | {self.room.hotel.hotel_name}"
    