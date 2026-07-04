from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin/Manager'),
        ('trainer', 'Trainer'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Batch(models.Model):
    name = models.CharField(max_length=100)  # e.g., Morning Batch, Evening Batch
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"

class Trainer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='trainer_profile')
    phone = models.CharField(max_length=20)
    specialization = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username

class Student(models.Model):
    LICENSE_CHOICES = (
        ('none', 'None (No License)'),
        ('learner', "Learner's License"),
        ('full', 'Full License'),
        ('expired', 'Expired License'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    )

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='student_profile')
    full_name = models.CharField(max_length=150)
    dob = models.DateField()
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    license_status = models.CharField(max_length=20, choices=LICENSE_CHOICES, default='none')
    preferred_batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    emergency_contact = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    registration_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.get_status_display()})"

class Attendance(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('excused', 'Excused'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_attendances')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.full_name} - {self.date}: {self.get_status_display()}"

class Announcement(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=200)
    content = models.TextField()
    target_batch = models.ForeignKey(Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name='announcements', help_text="Null means sent to all students")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (Target: {self.target_batch or 'All'})"

class Payment(models.Model):
    STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount_due = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    last_payment_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.full_name} - Paid: {self.amount_paid}/{self.amount_due} ({self.get_status_display()})"
