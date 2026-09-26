from rest_framework import serializers
from hotels.models import Hotel, HotelImages, RoomType, RoomImages, Facilities, RoomCategory
from hotels.service_translator import tranlsate_hotel_model, translate_room_model, translate_hotel_description,translate_room_description, translate_room_title
from bookings.models import Booking


# ========HOTEL SERIALIZERS=========
class HotelSerializer(serializers.ModelSerializer):
    hotel_images = serializers.ListField(
        child = serializers.ImageField(),
        write_only = True,
        required = True
    )
    
    room_count = serializers.SerializerMethodField()
    country_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Hotel
        fields = [
            'hotel_id',
            'hotel_name',
            'country',
            'country_name',
            'city',
            'hotel_images',
            'hotel_description',
            'room_count',
            'address'
        ]
        
        extra_kwargs = {
            'hotel_id': {'read_only': True},
            'hotel_description': {'write_only': True},
            'country_name': {'read_only': True}
        }
        
    def validate_hotel_images(self, value):
        if not value:
            raise serializers.ValidationError('You have to provide Images')
        return value
    
    def get_room_count(self, obj):
        return obj.roomtype_set.count()
    
    def get_country_name(self, obj):
        return obj.country.name
    
    
    def create(self, validated_data):
        images = validated_data.pop('hotel_images')
        owner = validated_data.pop('owner')
        
        hotel = Hotel.objects.create(**validated_data, owner=owner)
        
        tranlsate_hotel_model(hotel)
        
        # ---------------------
        
        for image_url in images:
            HotelImages.objects.create(
                hotel = hotel,
                image = image_url
            )
            
        return hotel
    

class HotelChangeSerializer(serializers.ModelSerializer):
    hotel_images = serializers.ListField(
        child = serializers.ImageField(),
        write_only = True
    )
    
    country_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Hotel
        fields = [
            'hotel_description',
            'hotel_name',
            'country',
            'country_name',
            'city',
            'address',
            'hotel_images'
        ]
        
    extra_kwargs = {
        'country_name': {'read_only': True}
    }
            
            
    def get_country_name(self, obj):
        return obj.country.name
        
    def update(self, instance, validated_data):
        images = validated_data.pop('hotel_images', [])
        
        new_description = str(validated_data.get('hotel_description')).splitlines()
        old_description = str(instance.hotel_description).splitlines()
        
        description_changed = new_description != old_description
    
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        if description_changed:
            translate_hotel_description(instance)
            
        
        if images:
            for image in images:
                HotelImages.objects.create(
                    hotel = instance,
                    image = image
                )
                
        return instance
    
# -----------FACILITIES SERIALIZER-------------
class FacilitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facilities
        fields = ['id', 'name', 'facility_svg']
        
        extra_kwargs = {
            'id': {'read_only': True}
        }
        
    
        

        
# ==============ROOM CATEGORY SERIALIZER===============
        
class RoomCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomCategory
        fields = ['id', 'name']
        
        extra_kwargs = {
            'id': {'read_only': True}
        }
    
# -----------------------------
            
class HotelDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['hotel_id', 'hotel_name']
    
# ===============ROOM SERIALIZERS================
class RoomSerializer(serializers.ModelSerializer):
    hotel_detail = HotelDetailSerializer(read_only=True, source='hotel')
    room_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=True
    )
    
    
    hotel = serializers.PrimaryKeyRelatedField(
        queryset = Hotel.objects.all(),
        write_only=True,
        allow_empty = False
    )
    
    room_facilities = serializers.PrimaryKeyRelatedField(
        queryset = Facilities.objects.all(),
        write_only=True,
        many=True,
        allow_empty=False
    )
    
    room_categories = serializers.PrimaryKeyRelatedField(
        queryset = RoomCategory.objects.all(),
        write_only=True,
        many=True,
        allow_empty=False
    )
    class Meta:
        model = RoomType
        fields = [
            'hotel',
            'hotel_detail',
            'rooms_quantity',
            'price_one_night',
            'max_guests_amount',
            'room_id',
            'room_title',
            'room_description',
            'room_facilities',
            'room_categories',
            'room_images',
        ]
        
        extra_kwargs = {
            'room_id': {'read_only': True}
        }
        
    def validate(self, attrs):
        images = attrs.get('room_images')
        facilities = attrs.get('room_facilties')
        categories = attrs.get('room_categories')
        
        if not images and not facilities and not categories:
            raise serializers.ValidationError('You need to provide images facilities an categories')
        
        return attrs
    
    def create(self, validated_data):
        images = validated_data.pop('room_images')
        room_facilities = validated_data.pop('room_facilities')
        room_categories = validated_data.pop('room_categories')
        
        room = RoomType.objects.create(**validated_data)
        translate_room_model(room)
        
        # --------------------
        
        if room_categories:
            room.room_categories.set(room_categories)
            
        if room_facilities:
            room.room_facilities.set(room_facilities)
        
        # -------------------
        for image in images:
            RoomImages.objects.create(
                room = room,
                image = image
            )
            
        return room
    

class RoomChangeSerializer(serializers.ModelSerializer):
    room_images = serializers.ListField(
        child = serializers.ImageField(),
        write_only = True
    )
    
    hotel = serializers.PrimaryKeyRelatedField(
        queryset = Hotel.objects.all(),
        allow_empty = False
    )
    
    room_facilities = serializers.PrimaryKeyRelatedField(
        queryset = Facilities.objects.all(),
        allow_empty = False,
        many = True
    )
    
    room_categories = serializers.PrimaryKeyRelatedField(
        queryset = RoomCategory.objects.all(),
        allow_empty = False,
        many = True
    )
    
    
    
    class Meta:
        model = RoomType
        fields = [
            'hotel',
            'rooms_quantity',
            'price_one_night',
            'max_guests_amount',
            'room_images',
            'room_title',
            'room_description',
            'room_facilities',
            'room_categories',
        ]
        
            
        
    def update(self, instance, validated_data):
        images = validated_data.pop('room_images', [])
        room_facilities = validated_data.pop('room_facilities')
        room_categories = validated_data.pop('room_categories')
        
        new_description = str(validated_data.get('room_description')).splitlines()
        new_title = str(validated_data.get('room_title')).splitlines()
        
        old_description = str(instance.room_description).splitlines()
        old_title = str(instance.room_title).splitlines()
        
        description_changed = new_description != old_description
        title_changed = new_title != old_title
            
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        if description_changed:
            translate_room_description(instance)
            
        if title_changed:
            translate_room_title(instance)
        
        # --------------------
                
        if room_categories:
            instance.room_categories.set(room_categories)
            
        if room_facilities:
            instance.room_facilities.set(room_facilities)
        
        # -------------------
        
        if images:
            for image in images:
                RoomImages.objects.create(
                    room = instance,
                    image = image
                )
                
        return instance
    
    
    
# ===============RESERVATIONS SERIALIZER============
class ReservationsSerializer(serializers.ModelSerializer):
    room = serializers.CharField(source='room.room_title')
    hotel = serializers.CharField(source='room.hotel.hotel_name')
    user = serializers.CharField(source='user.username')
    
    
    class Meta:
        model = Booking
        fields = [
            'room',
            'hotel',
            'check_in',
            'check_out',
            'user',
            'status'
        ]
        
    
    