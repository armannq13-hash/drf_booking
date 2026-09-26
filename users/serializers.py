from rest_framework import serializers
from .models import CustomUser
from bookings.models import Booking
from hotels.models import RoomType, Hotel

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'username',
            'password',
            'phone_number',
            'is_business'
        ]
        
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create(**validated_data)
        
        user.set_password(password)
        
        user.save()
        
        return user
    
    

    