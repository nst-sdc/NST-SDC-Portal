from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Provides authentication and profile management for the NST-SDC Portal.
    """
    
    # Profile fields
    bio = models.TextField(
        blank=True,
        null=True,
        help_text="User biography or description"
    )
    
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        help_text="User profile picture"
    )
    
    # Academic / Identify
    student_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Student ID / Roll Number"
    )
    
    batch_year = models.IntegerField(
        blank=True,
        null=True,
        help_text="Graduation Year (e.g., 2025)"
    )

    # Dev Club specific fields
    points = models.IntegerField(
        default=0,
        help_text="Gamification points for leaderboard"
    )

    github_username = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="GitHub username"
    )
    
    tech_skills = models.JSONField(
        default=list,
        blank=True,
        help_text="List of technical skills/technologies (e.g., ['Python', 'Django', 'React'])"
    )
    
    skill_level = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert'),
        ],
        help_text="Developer skill level"
    )
    
    portfolio_url = models.URLField(
        blank=True,
        null=True,
        help_text="Personal portfolio website"
    )
    
    linkedin_url = models.URLField(
        blank=True,
        null=True,
        help_text="LinkedIn profile URL"
    )
    
    # OAuth and authentication fields
    provider = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        choices=[
            ('github', 'GitHub'),
            ('google', 'Google'),
            ('local', 'Local'),
        ],
        help_text="Authentication provider"
    )
    
    provider_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Unique ID from OAuth provider"
    )
    
    github_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="GitHub OAuth user ID"
    )
    
    # Role flags
    is_member = models.BooleanField(
        default=False,
        help_text="Whether user is a club member"
    )
    
    is_club_admin = models.BooleanField(
        default=False,
        help_text="Whether user is a club administrator"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['provider', 'provider_id']),
            models.Index(fields=['github_id']),
            models.Index(fields=['points']),  # Indexed for leaderboard
        ]
    
    def __str__(self):
        return self.email or self.username
    
    def get_full_name(self):
        """Return the user's full name."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name or self.username
    
    def get_short_name(self):
        """Return the user's short name."""
        return self.first_name or self.username