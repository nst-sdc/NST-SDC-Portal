from django.db import models
from django.conf import settings
from django.utils import timezone


class Project(models.Model):
    """
    Project model for dev club projects.
    """
    
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='planning'
    )
    
    tech_stack = models.JSONField(default=list, blank=True)
    
    github_repo = models.URLField(blank=True, null=True)
    demo_url = models.URLField(blank=True, null=True)
    
    image = models.ImageField(upload_to='project_images/', blank=True, null=True)
    
    # Team
    lead = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='led_projects'
    )
    
    contributors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='contributed_projects',
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class Event(models.Model):
    """
    Event model for club activities.
    """
    
    EVENT_TYPE_CHOICES = [
        ('workshop', 'Workshop'),
        ('hackathon', 'Hackathon'),
        ('meetup', 'Meetup'),
        ('webinar', 'Webinar'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    event_type = models.CharField(
        max_length=20,
        choices=EVENT_TYPE_CHOICES,
        default='meetup'
    )
    
    event_date = models.DateTimeField()
    location = models.CharField(max_length=200, help_text="Physical location or Online")
    meeting_link = models.URLField(blank=True, null=True)
    

    banner = models.ImageField(upload_to='event_banners/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-event_date']

    def __str__(self):
        return f"{self.title} ({self.event_date.date()})"
    
    @property
    def is_past(self):
        return self.event_date < timezone.now()


class Attendance(models.Model):
    """
    Tracks user attendance at events.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='marked_attendances',
        help_text="Admin who marked this attendance"
    )
    
    marked_at = models.DateTimeField(auto_now_add=True)
    
    status = models.CharField(
        max_length=20,
        default='present',
        choices=[('present', 'Present'), ('absent', 'Absent'), ('excused', 'Excused')]
    )

    class Meta:
        unique_together = ['user', 'event']

    def __str__(self):
        return f"{self.user} at {self.event}"


class Task(models.Model):
    """
    Tasks assigned to members (Work management).
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('verified', 'Verified'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    points = models.IntegerField(default=10, help_text="Points awarded upon completion")
    
    due_date = models.DateTimeField(blank=True, null=True)
    
    submission_link = models.URLField(blank=True, null=True, help_text="Link to work (PR, Doc, etc)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.assigned_to}"