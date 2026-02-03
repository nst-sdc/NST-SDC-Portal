from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.db.models import F, Window, Q
from django.db.models.functions import RowNumber
from .serializers import (
    UserSerializer,
    UserProfileUpdateSerializer,
    UserRegistrationSerializer,
    LeaderboardSerializer,
    PasswordChangeSerializer,
)

User = get_user_model()


class UserLoginView(APIView):
    """Login endpoint for session authentication"""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            serializer = UserSerializer(user)
            return Response(
                {"detail": "Login successful", "user": serializer.data},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )


class UserLogoutView(APIView):
    """Logout endpoint"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Logout successful"}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    """Get authenticated user's profile"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Update user profile"""
        serializer = UserProfileUpdateSerializer(
            request.user, data=request.data, partial=True
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
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)


class UserPasswordChangeView(APIView):
    """
    An endpoint for changing password.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PasswordChangeSerializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not request.user.check_password(serializer.data.get("old_password")):
                return Response(
                    {"old_password": ["Wrong password."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # set_password also hashes the password that the user will get
            request.user.set_password(serializer.data.get("new_password"))
            request.user.save()
            return Response(
                {"detail": "Password updated successfully"}, status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IsClubAdmin(permissions.BasePermission):
    """
    Custom permission to only allow club admins to edit.
    """

    def has_permission(self, request, view):
        return request.user and (request.user.is_club_admin or request.user.is_staff)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing users.
    Admins can see/edit all users, regular users can see members only.
    """

    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsClubAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by member status
        if not (self.request.user.is_club_admin or self.request.user.is_staff):
            queryset = queryset.filter(is_member=True)

        # Filter by batch year
        batch = self.request.query_params.get("batch", None)
        if batch:
            queryset = queryset.filter(batch_year=batch)

        # Filter by skill level
        skill = self.request.query_params.get("skill", None)
        if skill:
            queryset = queryset.filter(skill_level=skill)

        # Search by name or username
        search = self.request.query_params.get("search", None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )

        return queryset.order_by("-created_at")

    @action(detail=True, methods=["get"])
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

    @action(detail=True, methods=["get"])
    def tasks(self, request, pk=None):
        """Get user's tasks"""
        from club.models import Task
        from club.serializers import TaskSerializer

        user = self.get_object()

        # Only allow viewing own tasks or if admin
        if user != request.user and not (
            request.user.is_club_admin or request.user.is_staff
        ):
            return Response(
                {"detail": "You do not have permission to view this user's tasks"},
                status=status.HTTP_403_FORBIDDEN,
            )

        tasks = Task.objects.filter(assigned_to=user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def attendance(self, request, pk=None):
        """Get user's attendance records"""
        from club.models import Attendance
        from club.serializers import AttendanceSerializer

        user = self.get_object()

        # Only allow viewing own attendance or if admin
        if user != request.user and not (
            request.user.is_club_admin or request.user.is_staff
        ):
            return Response(
                {"detail": "You do not have permission to view this user's attendance"},
                status=status.HTTP_403_FORBIDDEN,
            )

        attendances = Attendance.objects.filter(user=user).select_related("event")
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)


class LeaderboardView(APIView):
    """Get leaderboard sorted by points"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models import Sum, Count, Case, When, IntegerField
        from django.utils import timezone
        import datetime

        limit = int(request.query_params.get("limit", 50))
        period = request.query_params.get("period", "all_time")

        queryset = User.objects.filter(is_active=True, is_member=True)

        if period == "all_time":
            # Just use the total points field
            users = queryset.order_by("-points")[:limit]
            # Since serializer expects 'points', the model field works fine.
            # But let's verify if we need to return 'rank' as well. 
            # The original implementation used Window functions which is good for ranking.
            users = queryset.annotate(
                rank=Window(expression=RowNumber(), order_by=F("points").desc())
            ).order_by("-points")[:limit]

        else:
            # Calculate start date based on period
            now = timezone.now()
            start_date = now
            if period == "weekly":
                start_date = now - datetime.timedelta(days=7)
            elif period == "monthly":
                start_date = now - datetime.timedelta(days=30)
            
            # Aggregate points from Tasks and Attendance
            # Task: status='verified' (or 'submitted' depending on logic)
            # Attendance: status='present' (assuming 10 points per attendance, need to verify or assume)

            # Note: Task model has `points`. Attendance does not have a points field in the model shown earlier.
            # Assuming a fixed value for attendance, e.g., 5 points.
            ATTENDANCE_POINTS = 5

            # Better approach for Coalesce
            from django.db.models.functions import Coalesce
            
            users = queryset.annotate(
                task_points=Coalesce(Sum(
                    Case(
                        When(
                            tasks__updated_at__gte=start_date,
                            tasks__status__in=["verified", "submitted"],
                            then="tasks__points",
                        ),
                        default=0,
                        output_field=IntegerField(),
                    )
                ), 0),
                attendance_points=Coalesce(Count(
                    Case(
                        When(
                            attendances__marked_at__gte=start_date, 
                            attendances__status="present",
                            then=1,
                        ),
                        output_field=IntegerField(),
                    )
                ), 0) * ATTENDANCE_POINTS,
            ).annotate(
                period_points=F("task_points") + F("attendance_points")
            ).annotate(
                rank=Window(expression=RowNumber(), order_by=F("period_points").desc())
            ).order_by("-period_points")[:limit]

            # Override points for serialization
            for user in users:
                user.points = user.period_points
                
        return Response(LeaderboardSerializer(users, many=True).data)
