from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, Event, Attendance, Project

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user info for nested serializers"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'avatar', 'email']
        read_only_fields = fields


class ProjectSerializer(serializers.ModelSerializer):
    lead_details = UserMinimalSerializer(source='lead', read_only=True)
    contributors_details = UserMinimalSerializer(source='contributors', many=True, read_only=True)
    contributor_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'status', 'status_display',
            'tech_stack', 'github_repo', 'demo_url', 'image',
            'lead', 'lead_details', 'contributors', 'contributors_details',
            'contributor_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_contributor_count(self, obj):
        return obj.contributors.count()


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating projects"""
    class Meta:
        model = Project
        fields = [
            'name', 'description', 'status', 'tech_stack',
            'github_repo', 'demo_url', 'image', 'lead', 'contributors'
        ]


class EventSerializer(serializers.ModelSerializer):
    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    attendance_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'event_type_display',
            'event_date', 'location', 'meeting_link', 'banner',
            'is_past', 'attendance_count', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_attendance_count(self, obj):
        return obj.attendances.filter(status='present').count()


class AttendanceSerializer(serializers.ModelSerializer):
    user_details = UserMinimalSerializer(source='user', read_only=True)
    event_details = serializers.SerializerMethodField()
    marked_by_details = UserMinimalSerializer(source='marked_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'user', 'user_details', 'event', 'event_details',
            'marked_by', 'marked_by_details', 'marked_at',
            'status', 'status_display'
        ]
        read_only_fields = ['marked_at', 'marked_by']
    
    def get_event_details(self, obj):
        return {
            'id': obj.event.id,
            'title': obj.event.title,
            'event_date': obj.event.event_date,
            'event_type': obj.event.event_type
        }


class AttendanceMarkSerializer(serializers.ModelSerializer):
    """Simplified serializer for marking attendance"""
    class Meta:
        model = Attendance
        fields = ['user', 'event', 'status']


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_details = UserMinimalSerializer(source='assigned_to', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assigned_to', 'assigned_to_details',
            'status', 'status_display', 'points', 'due_date',
            'submission_link', 'is_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_is_overdue(self, obj):
        from django.utils import timezone
        if obj.due_date and obj.status not in ['verified', 'submitted']:
            return obj.due_date < timezone.now()
        return False


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating tasks"""
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'assigned_to', 'status',
            'points', 'due_date', 'submission_link'
        ]
