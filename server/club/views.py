from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Q, Count
from .models import Task, Event, Project, Attendance
from .serializers import (
    TaskSerializer, TaskCreateUpdateSerializer,
    EventSerializer, ProjectSerializer, ProjectCreateUpdateSerializer,
    AttendanceSerializer, AttendanceMarkSerializer,
    UserMinimalSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission: Allow read-only for authenticated users,
    write permissions for admins only.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and (request.user.is_club_admin or request.user.is_staff)


class DashboardViewSet(viewsets.ViewSet):
    """
    Dashboard endpoint providing overview of user's tasks and upcoming events.
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        
        # Active Tasks assigned to user
        active_tasks = Task.objects.filter(
            assigned_to=user, 
            status__in=['pending', 'in_progress']
        ).order_by('due_date')
        task_serializer = TaskSerializer(active_tasks, many=True)
        
        # Upcoming Events (next 5)
        upcoming_events = Event.objects.filter(
            event_date__gte=timezone.now()
        ).order_by('event_date')[:5]
        event_serializer = EventSerializer(upcoming_events, many=True)
        
        # User's recent projects
        user_projects = Project.objects.filter(
            Q(lead=user) | Q(contributors=user)
        ).distinct()[:3]
        project_serializer = ProjectSerializer(user_projects, many=True)
        
        # User's attendance count
        attendance_count = Attendance.objects.filter(
            user=user, 
            status='present'
        ).count()
        
        return Response({
            'user': {
                'id': user.id,
                'name': user.get_full_name(),
                'username': user.username,
                'email': user.email,
                'points': user.points,
                'batch': user.batch_year,
                'student_id': user.student_id,
                'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None,
                'is_admin': user.is_club_admin or user.is_staff,
            },
            'active_tasks': task_serializer.data,
            'upcoming_events': event_serializer.data,
            'recent_projects': project_serializer.data,
            'attendance_count': attendance_count,
        })


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing projects.
    List, Create, Retrieve, Update, Delete projects.
    """
    queryset = Project.objects.all().select_related('lead').prefetch_related('contributors')
    permission_classes = [IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateUpdateSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by tech stack
        tech = self.request.query_params.get('tech', None)
        if tech:
            queryset = queryset.filter(tech_stack__contains=[tech])
        
        # Filter by user (their projects)
        my_projects = self.request.query_params.get('my_projects', None)
        if my_projects and self.request.user.is_authenticated:
            queryset = queryset.filter(
                Q(lead=self.request.user) | Q(contributors=self.request.user)
            ).distinct()
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        """Allow user to join a project as contributor"""
        project = self.get_object()
        user = request.user
        
        if user in project.contributors.all():
            return Response(
                {'detail': 'You are already a contributor'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        project.contributors.add(user)
        return Response(
            {'detail': 'Successfully joined project'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def leave(self, request, pk=None):
        """Allow user to leave a project"""
        project = self.get_object()
        user = request.user
        
        if user not in project.contributors.all():
            return Response(
                {'detail': 'You are not a contributor'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        project.contributors.remove(user)
        return Response(
            {'detail': 'Successfully left project'},
            status=status.HTTP_200_OK
        )


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing events.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by event type
        event_type = self.request.query_params.get('type', None)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter upcoming/past
        time_filter = self.request.query_params.get('time', None)
        if time_filter == 'upcoming':
            queryset = queryset.filter(event_date__gte=timezone.now())
        elif time_filter == 'past':
            queryset = queryset.filter(event_date__lt=timezone.now())
        
        return queryset.order_by('-event_date')
    
    @action(detail=True, methods=['get'])
    def attendees(self, request, pk=None):
        """Get list of attendees for an event"""
        event = self.get_object()
        attendances = Attendance.objects.filter(event=event).select_related('user')
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance records.
    """
    queryset = Attendance.objects.all().select_related('user', 'event', 'marked_by')
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by event
        event_id = self.request.query_params.get('event', None)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        # Show user's own attendance if not admin
        if not (self.request.user.is_club_admin or self.request.user.is_staff):
            queryset = queryset.filter(user=self.request.user)
        
        return queryset.order_by('-marked_at')
    
    def create(self, request, *args, **kwargs):
        """Mark attendance - admin only"""
        if not (request.user.is_club_admin or request.user.is_staff):
            return Response(
                {'detail': 'Only admins can mark attendance'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AttendanceMarkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(marked_by=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def bulk_mark(self, request):
        """Bulk mark attendance for multiple users"""
        event_id = request.data.get('event')
        user_ids = request.data.get('users', [])
        attendance_status = request.data.get('status', 'present')
        
        if not event_id or not user_ids:
            return Response(
                {'detail': 'event and users are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response(
                {'detail': 'Event not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        created_count = 0
        for user_id in user_ids:
            attendance, created = Attendance.objects.get_or_create(
                user_id=user_id,
                event=event,
                defaults={
                    'marked_by': request.user,
                    'status': attendance_status
                }
            )
            if created:
                created_count += 1
        
        return Response({
            'detail': f'Marked attendance for {created_count} users'
        })


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tasks.
    """
    queryset = Task.objects.all().select_related('assigned_to')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Non-admins can only see their own tasks
        if not (user.is_club_admin or user.is_staff):
            queryset = queryset.filter(assigned_to=user)
        
        # Filter by status
        task_status = self.request.query_params.get('status', None)
        if task_status:
            queryset = queryset.filter(status=task_status)
        
        # Filter by assigned user
        assigned_to = self.request.query_params.get('assigned_to', None)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Only admins can create tasks"""
        if not (self.request.user.is_club_admin or self.request.user.is_staff):
            raise permissions.PermissionDenied('Only admins can create tasks')
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit a task"""
        task = self.get_object()
        
        if task.assigned_to != request.user:
            return Response(
                {'detail': 'You can only submit your own tasks'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        submission_link = request.data.get('submission_link')
        if not submission_link:
            return Response(
                {'detail': 'submission_link is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task.submission_link = submission_link
        task.status = 'submitted'
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def verify(self, request, pk=None):
        """Verify a submitted task and award points"""
        task = self.get_object()
        
        if task.status != 'submitted':
            return Response(
                {'detail': 'Task must be submitted before verification'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task.status = 'verified'
        task.save()
        
        # Award points to user
        user = task.assigned_to
        user.points += task.points
        user.save()
        
        serializer = self.get_serializer(task)
        return Response({
            'task': serializer.data,
            'points_awarded': task.points
        })
