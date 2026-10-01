from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'username',
            'email',
            'password',
            'phone_number',
            'is_business'
        ]
        
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        
        user.set_password(password)
        
        user.save()
        
        return user
    
    
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'


    