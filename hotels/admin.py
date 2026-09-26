from django.contrib import admin
from .models import Hotel,RoomType, RoomCategory, HotelImages, RoomImages, Facilities

# Register your models here.
admin.site.register(HotelImages)
admin.site.register(RoomImages)
admin.site.register(RoomCategory)
admin.site.register(RoomType)
admin.site.register(Hotel)
admin.site.register(Facilities)