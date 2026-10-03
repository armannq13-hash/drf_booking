from rest_framework.decorators import api_view, permission_classes
from .serializers import CustomUserSerializer, EmailVerificationSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import CustomUser



# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    email = request.data.get('email')
    CustomUser.objects.filter(email__iexact=email, is_active=False).delete()
    serializer = CustomUserSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Success!'
        }, status=status.HTTP_201_CREATED)
        
    
    return Response(status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    seralizer = EmailVerificationSerializer(data=request.data)
    
    if seralizer.is_valid():
        user = seralizer.validated_data['user']
        user.is_active = True
        user.save()
        
        user.otp_code.delete()
        
        return Response({
            'message': 'Email was verified successfully'
        }, status=status.HTTP_200_OK)
        
    return Response(seralizer.errors, status=status.HTTP_400_BAD_REQUEST)


