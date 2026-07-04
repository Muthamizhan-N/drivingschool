from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Batch, Student, User, Payment

User = get_user_model()

class DrivingSchoolTests(APITestCase):

    def setUp(self):
        # Create default Batches
        self.morning_batch = Batch.objects.create(
            name="Morning Batch",
            start_time="08:00:00",
            end_time="10:00:00"
        )
        self.evening_batch = Batch.objects.create(
            name="Evening Batch",
            start_time="17:00:00",
            end_time="19:00:00"
        )

        # Create Admin user
        self.admin_user = User.objects.create_user(
            username="admin_manager",
            password="adminpassword",
            email="admin@drivingschool.com",
            role="admin"
        )

        # Create Trainer user
        self.trainer_user = User.objects.create_user(
            username="trainer_bob",
            password="trainerpassword",
            email="bob@drivingschool.com",
            role="trainer"
        )

    def test_public_registration(self):
        url = reverse('api-register-public')
        data = {
            "full_name": "Alice Smith",
            "dob": "2000-01-01",
            "address": "123 Main St",
            "phone": "+1234567890",
            "email": "alice@example.com",
            "license_status": "none",
            "preferred_batch": self.morning_batch.id,
            "emergency_contact": "Bob Smith (+1234567891)"
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.count(), 1)
        
        student = Student.objects.first()
        self.assertEqual(student.full_name, "Alice Smith")
        self.assertEqual(student.status, "pending")
        self.assertIsNone(student.user)

    def test_student_approval_by_admin(self):
        # Create a pending student
        student = Student.objects.create(
            full_name="John Doe",
            dob="1995-05-15",
            address="456 Elm St",
            phone="+9876543210",
            email="john@example.com",
            license_status="learner",
            preferred_batch=self.evening_batch,
            emergency_contact="Jane Doe (+9876543211)",
            status="pending"
        )

        # Try to approve without logging in
        approve_url = reverse('student-approve', kwargs={'pk': student.id})
        response = self.client.post(approve_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Log in as Admin
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(approve_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify student details are updated
        student.refresh_from_db()
        self.assertEqual(student.status, "approved")
        self.assertIsNotNone(student.user)
        self.assertEqual(student.user.role, "student")
        
        # Verify credentials returned
        self.assertIn("username", response.data)
        self.assertIn("password", response.data)
        self.assertEqual(student.user.username, response.data["username"])

        # Verify default payment created
        self.assertTrue(Payment.objects.filter(student=student).exists())
        payment = Payment.objects.get(student=student)
        self.assertEqual(payment.amount_due, 500.00)
        self.assertEqual(payment.amount_paid, 0.00)
        self.assertEqual(payment.status, "unpaid")

    def test_role_based_permissions(self):
        # Create an approved student with a user profile
        student_user = User.objects.create_user(
            username="test.student",
            password="studentpassword",
            email="test.student@example.com",
            role="student"
        )
        student = Student.objects.create(
            user=student_user,
            full_name="Test Student",
            dob="1999-09-09",
            address="789 Pine St",
            phone="+5555555555",
            email="test.student@example.com",
            license_status="none",
            preferred_batch=self.morning_batch,
            emergency_contact="Emergency Contact",
            status="approved"
        )

        # Students should not have permission to list all students
        self.client.force_authenticate(user=student_user)
        url = reverse('student-list')
        response = self.client.get(url, format='json')
        # They will only see themselves in the queryset rather than getting a 403, 
        # since we customized get_queryset to return only self for students.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], student.id)

        # Students should NOT be able to view admin dashboard statistics
        stats_url = reverse('api-admin-stats')
        response = self.client.get(stats_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
