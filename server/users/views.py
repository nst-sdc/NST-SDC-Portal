from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.db.models import F, Window, Q
from django.db.models.functions import RowNumber
from .serializers import (
    UserSerializer, UserProfileUpdateSerializer,
    UserRegistrationSerializer, LeaderboardSerializer
)

User = get_user_model()


class UserLoginView(APIView):
    """Login endpoint for session authentication"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'detail': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            serializer = UserSerializer(user)
            return Response({
                'detail': 'Login successful',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserLogoutView(APIView):
    """Logout endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response(
            {'detail': 'Logout successful'},
            status=status.HTTP_200_OK
        )


class UserProfileView(APIView):
    """Get authenticated user's profile"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update user profile"""
        serializer = UserProfileUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return full user data
        full_serializer = UserSerializer(request.user)
        return Response(full_serializer.data)


class UserRegistrationView(APIView):
    """Register a new user"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Return user data
        user_serializer = UserSerializer(user)
        return Response(
            user_serializer.data,
            status=status.HTTP_201_CREATED
        )


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing users (read-only for non-admins).
    Admins can see all users, regular users can see members only.
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by member status
        if not (self.request.user.is_club_admin or self.request.user.is_staff):
            queryset = queryset.filter(is_member=True)
        
        # Filter by batch year
        batch = self.request.query_params.get('batch', None)
        if batch:
            queryset = queryset.filter(batch_year=batch)
        
        # Filter by skill level
        skill = self.request.query_params.get('skill', None)
        if skill:
            queryset = queryset.filter(skill_level=skill)
        
        # Search by name or username
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['get'])
    def projects(self, request, pk=None):
        """Get user's projects"""
        from club.models import Project
        from club.serializers import ProjectSerializer
        
        user = self.get_object()
        projects = Project.objects.filter(
            Q(lead=user) | Q(contributors=user)
        ).distinct()
        
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Get user's tasks"""
        from club.models import Task
        from club.serializers import TaskSerializer
        
        user = self.get_object()
        
        # Only allow viewing own tasks or if admin
        if user != request.user and not (request.user.is_club_admin or request.user.is_staff):
            return Response(
                {'detail': 'You do not have permission to view this user\'s tasks'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        tasks = Task.objects.filter(assigned_to=user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        """Get user's attendance records"""
        from club.models import Attendance
        from club.serializers import AttendanceSerializer
        
        user = self.get_object()
        
        # Only allow viewing own attendance or if admin
        if user != request.user and not (request.user.is_club_admin or request.user.is_staff):
            return Response(
                {'detail': 'You do not have permission to view this user\'s attendance'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        attendances = Attendance.objects.filter(user=user).select_related('event')
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)


class LeaderboardView(APIView):
    """Get leaderboard sorted by points"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get limit from query params (default 50)
        limit = int(request.query_params.get('limit', 50))
        
        # Get users ordered by points with ranking
        users = User.objects.filter(
            is_active=True,
            is_member=True
        ).annotate(
            rank=Window(
                expression=RowNumber(),
                order_by=F('points').desc()
            )
        ).order_by('-points')[:limit]
        
        serializer = LeaderboardSerializer(users, many=True)
        return Response(serializer.data)
