import random
import string
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken

from .models import User, Batch, Trainer, Student, Attendance, Announcement, Payment
from .serializers import (
    UserSerializer, BatchSerializer, TrainerSerializer, StudentSerializer,
    AttendanceSerializer, AnnouncementSerializer, PaymentSerializer
)

import threading
from django.core.mail import send_mail
from django.conf import settings

def send_email_background(subject, email_body, from_email, recipient):
    try:
        send_mail(
            subject,
            email_body,
            from_email,
            [recipient],
            fail_silently=False,
        )
        print(f"[LIVE EMAIL] Successfully sent email to {recipient}!")
    except Exception as e:
        print(f"[LIVE EMAIL] Real email not sent (SMTP not configured or offline): {e}")

def send_twilio_sms_background(twilio_sid, twilio_token, twilio_phone, to_phone, body):
    # Auto-clean and format local Indian numbers to international E.164
    clean_phone = to_phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if not clean_phone.startswith('+'):
        if len(clean_phone) == 10 and clean_phone.isdigit():
            clean_phone = f"+91{clean_phone}"

    try:
        from twilio.rest import Client
        twilio_client = Client(twilio_sid, twilio_token)
        twilio_client.messages.create(
            body=body,
            from_=twilio_phone,
            to=clean_phone
        )
        print(f"[LIVE SMS] Successfully sent SMS to {clean_phone}!")
    except Exception as e:
        print(f"[LIVE SMS] Real SMS not sent to {clean_phone}: {e}")


# Helper function to mock SMS, WhatsApp, and send real Email/SMS notifications in background threads
def send_mock_notification(student_name, phone, email, title, message):
    print("\n" + "="*60)
    print(f"[MOCK NOTIFICATION] DISPATCHING FOR: {student_name}")
    print("="*60)
    
    # 1. SMS Dispatch Simulation
    print(f"[SMS] Sent to {phone}:")
    print(f"   \"{title}: {message}\"")
    print("-" * 40)
    
    # 2. WhatsApp Dispatch Simulation
    print(f"[WhatsApp] Sent to {phone}:")
    print(f"   *{title}*\n   {message}")
    print("-" * 40)
    
    # 3. Email Dispatch Simulation & Real Email Attempt
    print(f"[Email Log] Sent to {email}:")
    print(f"   Subject: {title}")
    print(f"   Body: Dear {student_name},\n\n   {message}")
    print("="*60 + "\n")

    # Attempt to send a real SMS in a background thread if Twilio is configured
    twilio_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
    twilio_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
    twilio_phone = getattr(settings, 'TWILIO_PHONE_NUMBER', '')

    if twilio_sid and twilio_token and twilio_phone:
        sms_thread = threading.Thread(
            target=send_twilio_sms_background,
            args=(twilio_sid, twilio_token, twilio_phone, phone, f"{title}: {message}")
        )
        sms_thread.start()
    else:
        print("[LIVE SMS] Twilio credentials not set. Skipping real SMS dispatch.")

    # Attempt to send a real email in a background thread if SMTP is configured
    try:
        subject = title
        email_body = f"Dear {student_name},\n\n{message}\n\nBest Regards,\nDriving School Administration"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com')
        
        email_thread = threading.Thread(
            target=send_email_background,
            args=(subject, email_body, from_email, email)
        )
        email_thread.start()
    except Exception as e:
        print(f"[LIVE EMAIL] Failed to spawn background email thread: {e}")




class CustomObtainAuthToken(ObtainAuthToken):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        # On-demand admin self-healing check
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'adminpassword123', role='admin')
            print("Self-healed: Created default admin superuser on-demand!")

        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        response_data = {
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role
        }

        # If user is a student, attach student details
        if user.role == 'student':
            student = getattr(user, 'student_profile', None)
            if student:
                response_data['student_id'] = student.id
                response_data['student_status'] = student.status

        return Response(response_data)

class PublicRegistrationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Allow anyone to submit a pending student registration
        data = request.data
        batch_id = data.get('preferred_batch')
        
        try:
            batch = Batch.objects.get(id=batch_id) if batch_id else None
        except Batch.DoesNotExist:
            return Response({"error": "Preferred batch does not exist"}, status=status.HTTP_400_BAD_REQUEST)

        student = Student.objects.create(
            full_name=data.get('full_name'),
            dob=data.get('dob'),
            address=data.get('address'),
            phone=data.get('phone'),
            email=data.get('email'),
            license_status=data.get('license_status', 'none'),
            preferred_batch=batch,
            emergency_contact=data.get('emergency_contact'),
            status='pending'
        )

        return Response(
            {"message": "Registration submitted successfully. Your application is pending review.", "student_id": student.id},
            status=status.HTTP_201_CREATED
        )

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsAdminOrTrainer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'trainer']

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Student.objects.all().order_by('-registration_date')
        elif user.role == 'trainer':
            # Trainers see students assigned to batches
            return Student.objects.filter(status='approved').order_by('full_name')
        else:
            # Students only see themselves
            return Student.objects.filter(user=user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        student = self.get_object()
        if student.status != 'pending':
            return Response({"error": "Student is not in pending status"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Auto-generate credentials
        # Username format: firstname.student_id (lowercased, alphabetic only)
        first_name = "".join(c for c in student.full_name.split()[0] if c.isalpha()).lower()
        username = f"{first_name}.{student.id}"
        
        # Ensure username uniqueness
        counter = 1
        original_username = username
        while User.objects.filter(username=username).exists():
            username = f"{original_username}.{counter}"
            counter += 1
            
        password = "DS@" + first_name.capitalize() + str(student.id)

        # Create user account
        user = User.objects.create_user(
            username=username,
            email=student.email,
            password=password,
            first_name=student.full_name.split()[0],
            last_name=" ".join(student.full_name.split()[1:]) if len(student.full_name.split()) > 1 else "",
            role='student'
        )

        student.user = user
        student.status = 'approved'
        student.save()

        # Create default tuition payment
        Payment.objects.get_or_create(
            student=student,
            defaults={
                'amount_due': 500.00,
                'amount_paid': 0.00,
                'status': 'unpaid'
            }
        )

        # Dispatch alerts (SMS, WhatsApp, Email)
        notification_title = "Driving School Account Approved"
        notification_message = (
            f"Your application has been approved! Log in to your portal using details below:\n"
            f"URL: Portal Login\n"
            f"Login ID: {username}\n"
            f"Password: {password}"
        )
        send_mock_notification(
            student.full_name,
            student.phone,
            student.email,
            notification_title,
            notification_message
        )

        return Response({
            "message": "Student approved successfully. Account credentials generated.",
            "username": username,
            "password": password
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        student = self.get_object()
        if student.status != 'pending':
            return Response({"error": "Student is not in pending status"}, status=status.HTTP_400_BAD_REQUEST)
        
        student.status = 'rejected'
        student.save()

        # Dispatch alerts
        notification_title = "Application Update"
        notification_message = "Thank you for your interest. Unfortunately, your application for driving classes could not be approved at this time."
        send_mock_notification(
            student.full_name,
            student.phone,
            student.email,
            notification_title,
            notification_message
        )

        return Response({"message": "Student application rejected."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def toggle_status(self, request, pk=None):
        student = self.get_object()
        action_type = request.data.get('action')  # 'suspend' or 'activate'
        
        if action_type == 'suspend':
            student.status = 'suspended'
            student.save()
            if student.user:
                student.user.is_active = False
                student.user.save()
            return Response({"message": "Student account suspended."}, status=status.HTTP_200_OK)
        elif action_type == 'activate':
            student.status = 'approved'
            student.save()
            if student.user:
                student.user.is_active = True
                student.user.save()
            return Response({"message": "Student account reactivated."}, status=status.HTTP_200_OK)
            
        return Response({"error": "Invalid action. Use 'suspend' or 'activate'"}, status=status.HTTP_400_BAD_REQUEST)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAdminOrTrainer]

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_bulk(self, request):
        # Expects: { date: 'YYYY-MM-DD', attendance_records: [ { student_id: X, status: 'present'/'absent'/'excused', remarks: '' } ] }
        date = request.data.get('date')
        records = request.data.get('attendance_records', [])
        
        if not date:
            return Response({"error": "Date is required"}, status=status.HTTP_400_BAD_REQUEST)

        marked_records = []
        for rec in records:
            student_id = rec.get('student_id')
            status_val = rec.get('status')
            remarks = rec.get('remarks', '')

            student = get_object_or_404(Student, id=student_id)
            
            attendance, created = Attendance.objects.update_or_create(
                student=student,
                date=date,
                defaults={
                    'status': status_val,
                    'marked_by': request.user,
                    'remarks': remarks
                }
            )
            marked_records.append(attendance)

        return Response({
            "message": f"Successfully updated attendance for {len(marked_records)} students on {date}."
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def batch_sheet(self, request):
        batch_id = request.query_params.get('batch_id')
        date = request.query_params.get('date', timezone.now().date().isoformat())
        
        if not batch_id:
            return Response({"error": "batch_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        students = Student.objects.filter(preferred_batch_id=batch_id, status='approved')
        attendance_map = {att.student.id: att for att in Attendance.objects.filter(date=date, student__preferred_batch_id=batch_id)}
        
        data = []
        for s in students:
            att = attendance_map.get(s.id)
            data.append({
                'student_id': s.id,
                'student_name': s.full_name,
                'status': att.status if att else 'absent', # Default to absent or empty if not marked
                'is_marked': att is not None,
                'remarks': att.remarks if att else ''
            })
            
        return Response(data, status=status.HTTP_200_OK)

class LiveAttendanceFeedView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Fetch the last 15 check-ins across all batches
        attendances = Attendance.objects.all().order_by('-created_at')[:15]
        data = []
        for att in attendances:
            # Trainer name or Admin who marked it
            trainer_name = att.marked_by.get_full_name() or att.marked_by.username if att.marked_by else "System"
            data.append({
                "student_name": att.student.full_name,
                "trainer_name": trainer_name,
                "date": att.date.isoformat(),
                "time": att.created_at.strftime("%I:%M %p"),
                "status": att.status,
                "batch_name": att.student.preferred_batch.name if att.student.preferred_batch else "N/A"
            })
        return Response(data, status=status.HTTP_200_OK)

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'trainer']:
            return Announcement.objects.all().order_by('-created_at')
        else:
            # Students see general announcements + batch-specific announcements
            student = getattr(user, 'student_profile', None)
            if student:
                return Announcement.objects.filter(
                    Q(target_batch__isnull=True) | Q(target_batch=student.preferred_batch)
                ).order_by('-created_at')
            return Announcement.objects.filter(target_batch__isnull=True).order_by('-created_at')

    def perform_create(self, serializer):
        announcement = serializer.save(sender=self.request.user)
        
        # Mock SMS, WhatsApp, and Email triggers for target batch
        target_batch = announcement.target_batch
        if target_batch:
            recipients = Student.objects.filter(preferred_batch=target_batch, status='approved')
            batch_label = target_batch.name
        else:
            recipients = Student.objects.filter(status='approved')
            batch_label = "All Batches"
            
        print(f"\n[ANNOUNCEMENT] BROADCASTING: '{announcement.title}' to {batch_label}")
        for student in recipients:
            send_mock_notification(
                student.full_name,
                student.phone,
                student.email,
                f"Announcement: {announcement.title}",
                announcement.content
            )

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Payment.objects.all()
        else:
            # Student can only see their own payment status
            return Payment.objects.filter(student__user=user)

class AdminDashboardStatsView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        total_students = Student.objects.count()
        active_students = Student.objects.filter(status='approved').count()
        pending_students = Student.objects.filter(status='pending').count()
        
        # Today's attendance percentage
        today_attendance_total = Attendance.objects.filter(date=today, student__status='approved').count()
        today_present = Attendance.objects.filter(date=today, status='present', student__status='approved').count()
        
        today_attendance_pct = 0
        if today_attendance_total > 0:
            today_attendance_pct = round((today_present / today_attendance_total) * 100)
        elif active_students > 0:
            # Fallback if attendance isn't fully marked yet
            today_attendance_pct = round((Attendance.objects.filter(date=today, status='present').count() / active_students) * 100)
            
        # Batch statistics
        batches = Batch.objects.all()
        batch_stats = []
        for b in batches:
            count = Student.objects.filter(preferred_batch=b, status='approved').count()
            batch_stats.append({
                "name": b.name,
                "student_count": count
            })

        # Recent activities (new pending registrations, or marked attendance)
        recent_registrations = Student.objects.filter(status='pending').order_by('-registration_date')[:5]
        pending_list = [{
            "id": r.id,
            "full_name": r.full_name,
            "phone": r.phone,
            "preferred_batch": r.preferred_batch.name if r.preferred_batch else "N/A",
            "time": r.registration_date.strftime("%I:%M %p")
        } for r in recent_registrations]

        return Response({
            "metrics": {
                "total_students": total_students,
                "active_students": active_students,
                "pending_registrations": pending_students,
                "today_attendance_rate": min(today_attendance_pct, 100),
            },
            "batch_stats": batch_stats,
            "pending_list": pending_list
        }, status=status.HTTP_200_OK)

class StudentDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'student':
            return Response({"error": "Only student users can access this page."}, status=status.HTTP_403_FORBIDDEN)
            
        student = get_object_or_404(Student, user=user)
        
        # Progress tracking: total training sessions = 15
        total_sessions = 15
        completed_sessions = Attendance.objects.filter(student=student, status='present').count()
        
        # Payment details
        payment = Payment.objects.filter(student=student).first()
        payment_status = "Unpaid"
        amount_due = 500.00
        amount_paid = 0.00
        if payment:
            payment_status = payment.get_status_display()
            amount_due = payment.amount_due
            amount_paid = payment.amount_paid

        # Schedule
        schedule = [
            {"day": "Monday", "topic": "Basic Vehicle Control & Steering", "time": "08:00 AM" if student.preferred_batch and "Morning" in student.preferred_batch.name else "05:00 PM"},
            {"day": "Tuesday", "topic": "Clutch Control & Gears shifting", "time": "08:00 AM" if student.preferred_batch and "Morning" in student.preferred_batch.name else "05:00 PM"},
            {"day": "Wednesday", "topic": "Reverse & Parallel Parking", "time": "08:00 AM" if student.preferred_batch and "Morning" in student.preferred_batch.name else "05:00 PM"},
            {"day": "Thursday", "topic": "Slope start & Traffic simulation", "time": "08:00 AM" if student.preferred_batch and "Morning" in student.preferred_batch.name else "05:00 PM"},
            {"day": "Friday", "topic": "Highway Driving & Night Simulation", "time": "08:00 AM" if student.preferred_batch and "Morning" in student.preferred_batch.name else "05:00 PM"}
        ]

        # Filter announcements targeting this student's batch or all students
        announcements = Announcement.objects.filter(
            Q(target_batch__isnull=True) | Q(target_batch=student.preferred_batch)
        ).order_by('-created_at')[:5]
        
        announcements_data = AnnouncementSerializer(announcements, many=True).data

        return Response({
            "profile": StudentSerializer(student).data,
            "progress": {
                "completed": completed_sessions,
                "total": total_sessions,
                "percentage": round((completed_sessions / total_sessions) * 100) if total_sessions > 0 else 0
            },
            "payment": {
                "status": payment_status,
                "amount_due": amount_due,
                "amount_paid": amount_paid,
                "balance": amount_due - amount_paid
            },
            "schedule": schedule,
            "announcements": announcements_data
        }, status=status.HTTP_200_OK)

class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({"error": "Both old and new passwords are required"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({"error": "Incorrect old password"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully!"}, status=status.HTTP_200_OK)

