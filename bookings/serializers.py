from rest_framework import serializers
from .models import Booking
from hotels.models import RoomType
from django.db.models import Count, Q

class BookingSerializerClass(serializers.ModelSerializer):
    room = serializers.PrimaryKeyRelatedField(
        queryset=RoomType.objects.all(),
    )
    
    rooms_amount = serializers.IntegerField(write_only=True)
    
    
    class Meta:
        model = Booking
        fields = [
            'check_in',
            'check_out',
            'room',
            'rooms_amount',
        ]
        
    def validate(self, attrs):
        room_instance = attrs.get('room')
        rooms_amount = attrs.get('rooms_amount')
        checkIn = attrs.get('check_in')
        checkOut = attrs.get('check_out')
        
        room = RoomType.objects.filter(room_id=room_instance.room_id).annotate(
            intersections = Count(
                'booking',
                filter = Q(
                    booking__check_in__lt=checkOut,
                    booking__check_out__gt=checkIn
                ) &
                Q(
                    booking__status='active'
                )
            )
        ).first()
        
        room_quantity = room.rooms_quantity
        available_rooms_amount = int(room_quantity) - int(room.intersections)
        
        if rooms_amount <= 0:
            raise serializers.ValidationError({
                "rooms_amount": "You cannot book 0 rooms"
            })
            
        if available_rooms_amount <= 0:
            raise serializers.ValidationError({
                "rooms_amount": "No available room left"
            })
            
        if int(rooms_amount) > int(available_rooms_amount):
            raise serializers.ValidationError({
                "rooms_amount": f"Only {available_rooms_amount} room(-s) left"
            })
        
        return attrs
        
        
    def create(self, validated_data):
        user = validated_data.pop('user')
        rooms_amount = validated_data.pop('rooms_amount')
        
        created_reservations = []
        
        for i in range(int(rooms_amount)):
            booking = Booking.objects.create(**validated_data, user=user)
            created_reservations.append(booking)
            
        return created_reservations[-1]