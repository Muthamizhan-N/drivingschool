from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomObtainAuthToken, PublicRegistrationView, BatchViewSet, StudentViewSet,
    AttendanceViewSet, LiveAttendanceFeedView, AnnouncementViewSet, PaymentViewSet,
    AdminDashboardStatsView, StudentDashboardView, ChangePasswordView
)

router = DefaultRouter()
router.register(r'batches', BatchViewSet, basename='batch')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomObtainAuthToken.as_view(), name='api-login'),
    path('register-public/', PublicRegistrationView.as_view(), name='api-register-public'),
    path('attendance/live-feed/', LiveAttendanceFeedView.as_view(), name='api-attendance-live'),
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='api-admin-stats'),
    path('dashboard/student/', StudentDashboardView.as_view(), name='api-student-dashboard'),
    path('change-password/', ChangePasswordView.as_view(), name='api-change-password'),
]
