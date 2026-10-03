from rest_framework import serializers
from .models import CustomUser, EmailVerificationOTP
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.core.mail import send_mail
from dotenv import load_dotenv
import os

load_dotenv()

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
        user = CustomUser(**validated_data, is_active=False)
        
        user.set_password(password)
        
        user.save()
        
        # =======ONE TIME EMAIL CODE========
        code = EmailVerificationOTP.generate_code()
        EmailVerificationOTP.objects.update_or_create(
            user = user,
            defaults={'code': code}
        )
        
        sender_email = os.getenv('EMAIL_HOST_USER')
        
        send_mail(
            subject = 'Email verification one time code',
            message= f'Your verification code: {code}',
            from_email=sender_email,
            recipient_list=[user.email]
        )
        
        return user
    
    
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    
    
class EmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    
    def validate(self, data):
        email = data.get('email')
        code = data.get('code')
        
        try:
            otp_record = EmailVerificationOTP.objects.get(user__email=email)
        except EmailVerificationOTP.DoesNotExist:
            raise serializers.ValidationError({'detail': 'Invalid email or code expired'})
        
        if not otp_record.is_valid():
            otp_record.delete()
            raise serializers.ValidationError({'detail': 'The code is expired'})
        
        if int(otp_record.code) != int(code):
            raise serializers.ValidationError({'detail': 'The code does not match'})
        
        data['user'] = otp_record.user
        return data
            


    