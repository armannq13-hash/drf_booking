from rest_framework.decorators import api_view, permission_classes
from .serializers import CustomUserSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated



# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = CustomUserSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Success!'
        }, status=status.HTTP_201_CREATED)
        
    
    return Response(status=status.HTTP_400_BAD_REQUEST)



