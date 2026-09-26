from django.db import models
from users.models import CustomUser
from django_countries.fields import CountryField
from django.utils.text import slugify
import uuid

# Create your models here.

class Facilities(models.Model):
    name = models.CharField(max_length=100)
    facility_svg = models.TextField()
    
    def __str__(self):
        return self.name
    
class RoomCategory(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name

# ----------------------------
class Hotel(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    hotel_name = models.CharField(max_length=150)
    hotel_description = models.TextField()
    
    hotel_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    
    country = CountryField(blank_label=('Choose a country'))
    city = models.CharField(max_length=50)
    address = models.TextField()
    
    slug = models.SlugField(unique=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.hotel_name)
            
        original_slug = self.slug
        counter = 1
        
        while Hotel.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
            self.slug = f"{original_slug}-{counter}"
            counter += 1
            
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.hotel_name
        
        
class RoomType(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    rooms_quantity = models.PositiveIntegerField()
    price_one_night = models.PositiveIntegerField()
    max_guests_amount = models.PositiveBigIntegerField()
    
    room_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    
    room_title = models.CharField(max_length=100)
    room_description = models.TextField()
    room_facilities = models.ManyToManyField(Facilities)
    room_categories = models.ManyToManyField(RoomCategory)
    
    
    slug = models.SlugField(unique=True, blank=True)
    
    
    def save(self, *args, **kwargs):
            if not self.slug:
                self.slug = slugify(self.room_title)
                
            original_slug = self.slug
            counter = 1
            
            while RoomType.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
                
            super().save(*args, **kwargs)
            
    def __str__(self):
        return self.room_title
            
            
# -----------------------------------
class HotelImages(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='hotelImages')
    

class RoomImages(models.Model):
    room = models.ForeignKey(RoomType, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='roomImages')