from django.db import models
from django.contrib.auth.models import AbstractUser

from django.utils import timezone
from datetime import timedelta
import random
# Create your models here.

class CustomUser(AbstractUser):
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_business = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    
    REQUIRED_FIELDS = ['phone_number', 'username']
    
    def __str__(self):
        return self.email



class EmailVerificationOTP(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='otp_code')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def is_valid(self):
        return timezone.now() < self.created_at + timedelta(minutes=5)
    
    @staticmethod #@staticmethod tells that the method inside a class is just a function (without self)
    def generate_code():
        return str(random.randint(100000, 999999)) 
    