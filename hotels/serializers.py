from rest_framework import serializers
from .models import Hotel, RoomType, Facilities, HotelImages, RoomCategory




class HotelHomeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(source='hotelimages_set.first.image')
    class Meta:
        model = Hotel
        fields = [
            'hotel_name',
            'hotel_description',
            'country',
            'city',
            'image',
            'hotel_id',            
        ]
        
        
class FilteredRoomsSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(source='roomimages_set.first.image')
    hotel_name = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()
    
    class Meta:
        model = RoomType
        fields = [
            'price_one_night',
            'max_guests_amount',
            'room_id',
            'room_title',
            'room_description',
            'image',
            'hotel_name',
            'city',
            'country',
        ]
        
    def get_hotel_name(self, obj):
        return obj.hotel.hotel_name
            
    def get_city(self, obj):
        return obj.hotel.city

    def get_country(self, obj):
        return str(obj.hotel.country) 
    
    
# =========DESKTOP PROPERTY SERIALIZER=========
class HotelDashboardSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    class Meta:
        model = Hotel
        fields = [
            'hotel_name',
            'country',
            'city',
            'address',
            'images',
            'hotel_description',
            'hotel_id',
        ]
        
        
    def get_images(self, obj):
        request = self.context.get('request')
        image_urls = []
        
        for img in obj.hotelimages_set.all():
            image_url = img.image.url
            if request:
                image_url = request.build_absolute_uri(image_url)
            image_urls.append(image_url)
            
        return image_urls
        

# =============DASHBOARD ROOMS==========
class RoomCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomCategory
        fields = [
            'name'
        ]
        
class RoomFacilitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facilities
        fields = [
            'name',
            'facility_svg'
        ]


class RoomsDashboardSerializer(serializers.ModelSerializer):
    room_categories = RoomCategoriesSerializer(many=True)
    room_facilities = RoomFacilitiesSerializer(many=True)
    room_images = serializers.SerializerMethodField()
    class Meta:
        model = RoomType
        fields = [
            'room_title',
            'max_guests_amount',
            'room_description',
            'room_categories',
            'room_facilities',
            'room_images',
            'price_one_night',
            'room_id',
            'price_one_night'
        ]
        
    def get_room_images(self, obj):
        request = self.context.get('request')
        image_urls = []
        
        for image in obj.roomimages_set.all():
            image_url = image.image.url
            
            if request:
                image_url = request.build_absolute_uri(image_url)
            image_urls.append(image_url)
            
        return image_urls
            
            