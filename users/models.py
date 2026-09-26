from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class CustomUser(AbstractUser):
    username = models.CharField(max_length=20, unique=True)
    phone_number = models.CharField(max_length=20)
    password = models.CharField(max_length=50)
    is_business = models.BooleanField(default=False)
    
    REQUIRED_FIELDS = ['phone_number', 'password']
    
    def __str__(self):
        return self.username