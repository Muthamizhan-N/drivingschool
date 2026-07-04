import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

// Create Axios Instance
const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Local Mock Database Initialization (Fallback when Django is offline)
const initMockDB = () => {
  if (!localStorage.getItem('mock_initialized')) {
    const batches = [
      { id: 1, name: 'Morning Batch', start_time: '08:00', end_time: '10:00' },
      { id: 2, name: 'Evening Batch', start_time: '17:00', end_time: '19:00' }
    ];

    const students = [
      {
        id: 1,
        full_name: 'John Doe',
        dob: '1998-04-12',
        address: '102 Indigo Way, NY',
        phone: '+1 (555) 123-4567',
        email: 'john.doe@gmail.com',
        license_status: 'none',
        preferred_batch: 1,
        emergency_contact: 'Mary Doe (+1 555-987-6543)',
        status: 'approved',
        registration_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        full_name: 'Sarah Connor',
        dob: '1995-11-20',
        address: '204 Cyberdyne Rd, LA',
        phone: '+1 (555) 987-6543',
        email: 'sconnor@resistance.net',
        license_status: 'learner',
        preferred_batch: 2,
        emergency_contact: 'John Connor (+1 555-111-2222)',
        status: 'pending',
        registration_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        full_name: 'Bruce Wayne',
        dob: '1990-02-19',
        address: 'Wayne Manor, Gotham',
        phone: '+1 (555) 999-8888',
        email: 'bruce@waynecorp.com',
        license_status: 'full',
        preferred_batch: 1,
        emergency_contact: 'Alfred Pennyworth (+1 555-000-1111)',
        status: 'approved',
        registration_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const users = [
      { id: 1, username: 'admin', role: 'admin', first_name: 'Manager', last_name: 'Director' },
      { id: 2, username: 'john.1', role: 'student', first_name: 'John', last_name: 'Doe' },
      { id: 3, username: 'bruce.3', role: 'student', first_name: 'Bruce', last_name: 'Wayne' }
    ];

    const attendance = [
      { id: 1, student_id: 1, date: '2026-06-22', status: 'present', remarks: 'Good clutch control' },
      { id: 2, student_id: 3, date: '2026-06-22', status: 'present', remarks: 'Perfect parallel park' },
      { id: 3, student_id: 1, date: '2026-06-21', status: 'present', remarks: 'Basic steering OK' },
      { id: 4, student_id: 1, date: '2026-06-20', status: 'present', remarks: 'Intro to brakes' },
      { id: 5, student_id: 1, date: '2026-06-19', status: 'absent', remarks: 'No show' },
      { id: 6, student_id: 1, date: '2026-06-18', status: 'present', remarks: 'Theory class' }
    ];

    const announcements = [
      {
        id: 1,
        sender_name: 'Manager Director',
        title: 'Session Cancelled - Impending Rain',
        content: 'Today evening driving sessions are cancelled due to heavy rain. Please reschedule tomorrow.',
        target_batch: 2,
        target_batch_name: 'Evening Batch',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        sender_name: 'Manager Director',
        title: 'New Simulator Available',
        content: 'We have installed a brand new 3D driving simulator in room 102. Feel free to book slots.',
        target_batch: null,
        target_batch_name: 'All',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const payments = [
      { id: 1, student_id: 1, student_name: 'John Doe', amount_due: 500, amount_paid: 200, status: 'partial', last_payment_date: '2026-06-18' },
      { id: 2, student_id: 3, student_name: 'Bruce Wayne', amount_due: 500, amount_paid: 500, status: 'paid', last_payment_date: '2026-06-12' }
    ];

    const notifications = [];

    localStorage.setItem('mock_batches', JSON.stringify(batches));
    localStorage.setItem('mock_students', JSON.stringify(students));
    localStorage.setItem('mock_users', JSON.stringify(users));
    localStorage.setItem('mock_attendance', JSON.stringify(attendance));
    localStorage.setItem('mock_announcements', JSON.stringify(announcements));
    localStorage.setItem('mock_payments', JSON.stringify(payments));
    localStorage.setItem('mock_notifications', JSON.stringify(notifications));
    localStorage.setItem('mock_initialized', 'true');
  }
};

// Check if Backend API is active
let isBackendOffline = false;

export const checkBackendStatus = async () => {
  try {
    await axios.get(`${API_BASE}/batches/`, { timeout: 1500 });
    isBackendOffline = false;
  } catch (e) {
    // If we get an auth error, it means backend is alive but requires auth
    if (e.response && e.response.status === 401) {
      isBackendOffline = false;
    } else {
      isBackendOffline = true;
      initMockDB();
      console.warn("Django Backend is offline. Falling back to LocalStorage Mock DB.");
    }
  }
  return isBackendOffline;
};

// Log mock notifications to browser console as well as store them
const mockNotify = (studentName, phone, email, title, message) => {
  const logs = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
  const newLog = {
    id: Date.now(),
    student_name: studentName,
    phone,
    email,
    title,
    message,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem('mock_notifications', JSON.stringify(logs));

  console.log("%c📡 [DISPATCHING MOCK NOTIFICATIONS]", "color: #4f46e5; font-weight: bold; font-size: 14px;");
  console.log(`To Student: ${studentName}`);
  console.log(`📱 [SMS] Sent to ${phone}:\n   "${title}: {message}"`);
  console.log(`💬 [WhatsApp] Sent to ${phone}:\n   🟢 *${title}*\n   {message}`);
  console.log(`📧 [Email] Sent to ${email}:\n   Subject: ${title}\n   Body: ${message}`);
  console.log("-----------------------------------------");
};

// Helper for Mock DB CRUD operations
const getMockData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setMockData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ==========================================
// API Operations
// ==========================================

export const login = async (username, password) => {
  await checkBackendStatus();
  if (isBackendOffline) {
    if (username === 'admin') {
      const auth = { token: 'mock-admin-token', user_id: 1, username: 'admin', role: 'admin', first_name: 'Manager', last_name: 'Director' };
      localStorage.setItem('token', auth.token);
      localStorage.setItem('user', JSON.stringify(auth));
      return auth;
    }
    
    const students = getMockData('mock_students');
    const matchedStudent = students.find(s => s.status === 'approved' && s.full_name.toLowerCase().startsWith(username.split('.')[0]));
    
    if (matchedStudent) {
      const auth = {
        token: `mock-student-token-${matchedStudent.id}`,
        user_id: matchedStudent.id + 10,
        username,
        role: 'student',
        first_name: matchedStudent.full_name.split(' ')[0],
        last_name: matchedStudent.full_name.split(' ')[1] || '',
        student_id: matchedStudent.id,
        student_status: matchedStudent.status
      };
      localStorage.setItem('token', auth.token);
      localStorage.setItem('user', JSON.stringify(auth));
      return auth;
    }
    
    throw new Error('Invalid mock credentials. (Use "admin" or approved student username format like "john.1").');
  }

  const response = await client.post('/login/', { username, password });
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data));
  return response.data;
};

export const registerPublic = async (studentData) => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const students = getMockData('mock_students');
    const newStudent = {
      id: students.length + 1,
      ...studentData,
      preferred_batch: parseInt(studentData.preferred_batch),
      status: 'pending',
      registration_date: new Date().toISOString()
    };
    students.push(newStudent);
    setMockData('mock_students', students);
    return { message: "Registration submitted successfully. Your application is pending review.", student_id: newStudent.id };
  }
  const response = await client.post('/register-public/', studentData);
  return response.data;
};

export const getAdminStats = async () => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const students = getMockData('mock_students');
    const attendance = getMockData('mock_attendance');
    const batches = getMockData('mock_batches');
    const today = new Date().toISOString().split('T')[0];

    const total = students.length;
    const active = students.filter(s => s.status === 'approved').count || students.filter(s => s.status === 'approved').length;
    const pending = students.filter(s => s.status === 'pending').length;

    // Today's attendance rate
    const todayRecs = attendance.filter(a => a.date === today);
    const presentCount = todayRecs.filter(a => a.status === 'present').length;
    const rate = active > 0 ? Math.round((presentCount / active) * 100) : 0;

    const batch_stats = batches.map(b => ({
      name: b.name,
      student_count: students.filter(s => s.preferred_batch === b.id && s.status === 'approved').length
    }));

    const pending_list = students.filter(s => s.status === 'pending').map(s => ({
      id: s.id,
      full_name: s.full_name,
      phone: s.phone,
      preferred_batch: batches.find(b => b.id === s.preferred_batch)?.name || 'N/A',
      time: new Date(s.registration_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return {
      metrics: {
        total_students: total,
        active_students: active,
        pending_registrations: pending,
        today_attendance_rate: rate || 67 // Default demo fallbacks if 0
      },
      batch_stats,
      pending_list
    };
  }
  const response = await client.get('/dashboard/stats/');
  return response.data;
};

export const getStudents = async () => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const students = getMockData('mock_students');
    const batches = getMockData('mock_batches');
    return students.map(s => ({
      ...s,
      batch_details: batches.find(b => b.id === s.preferred_batch)
    }));
  }
  const response = await client.get('/students/');
  return response.data;
};

export const approveStudent = async (id) => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const students = getMockData('mock_students');
    const payments = getMockData('mock_payments');
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index].status = 'approved';
      const student = students[index];
      
      const first_name = student.full_name.split(' ')[0].toLowerCase();
      const username = `${first_name}.${student.id}`;
      const password = `DS@${first_name.charAt(0).toUpperCase() + first_name.slice(1)}${student.id}`;

      // Create tuition billing profile
      payments.push({
        id: payments.length + 1,
        student_id: student.id,
        student_name: student.full_name,
        amount_due: 500.00,
        amount_paid: 0.00,
        status: 'unpaid',
        last_payment_date: null
      });

      setMockData('mock_students', students);
      setMockData('mock_payments', payments);

      mockNotify(
        student.full_name,
        student.phone,
        student.email,
        "Driving School Account Approved",
        `Your application has been approved! Login ID: ${username}, Password: ${password}`
      );

      return { username, password };
    }
    throw new Error("Student not found");
  }
  const response = await client.post(`/students/${id}/approve/`);
  return response.data;
};

export const rejectStudent = async (id) => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const students = getMockData('mock_students');
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index].status = 'rejected';
      const student = students[index];
      setMockData('mock_students', students);

      mockNotify(
        student.full_name,
        student.phone,
        student.email,
        "Application Update",
        "Your driving school application could not be approved at this time."
      );
      return { message: "Rejected" };
    }
    throw new Error("Student not found");
  }
  const response = await client.post(`/students/${id}/reject/`);
  return response.data;
};

export const toggleStudentStatus = async (id, action) => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const students = getMockData('mock_students');
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index].status = action === 'suspend' ? 'suspended' : 'approved';
      setMockData('mock_students', students);
      return { message: `Student status: ${students[index].status}` };
    }
    throw new Error("Student not found");
  }
  const response = await client.post(`/students/${id}/toggle_status/`, { action });
  return response.data;
};

export const getBatches = async () => {
  await checkBackendStatus();
  if (isBackendOffline) {
    return getMockData('mock_batches');
  }
  const response = await client.get('/batches/');
  return response.data;
};

export const getAttendanceSheet = async (batchId, date) => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const students = getMockData('mock_students').filter(s => s.preferred_batch === parseInt(batchId) && s.status === 'approved');
    const attendance = getMockData('mock_attendance').filter(a => a.date === date);
    
    return students.map(s => {
      const record = attendance.find(a => a.student_id === s.id);
      return {
        student_id: s.id,
        student_name: s.full_name,
        status: record ? record.status : 'absent',
        is_marked: record !== undefined,
        remarks: record ? record.remarks : ''
      };
    });
  }
  const response = await client.get(`/attendance/batch_sheet/?batch_id=${batchId}&date=${date}`);
  return response.data;
};

export const markBulkAttendance = async (date, records) => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const attendance = getMockData('mock_attendance');
    
    records.forEach(rec => {
      const existingIdx = attendance.findIndex(a => a.date === date && a.student_id === rec.student_id);
      const data = {
        student_id: rec.student_id,
        date,
        status: rec.status,
        remarks: rec.remarks || ''
      };
      
      if (existingIdx !== -1) {
        attendance[existingIdx] = { ...attendance[existingIdx], ...data };
      } else {
        attendance.push({
          id: attendance.length + 1,
          ...data
        });
      }
    });

    setMockData('mock_attendance', attendance);
    return { message: "Attendance marked successfully" };
  }
  const response = await client.post('/attendance/mark_bulk/', { date, attendance_records: records });
  return response.data;
};

export const getLiveAttendanceFeed = async () => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const attendance = getMockData('mock_attendance');
    const students = getMockData('mock_students');
    const batches = getMockData('mock_batches');
    
    // Sort latest by ID (mimic created_at)
    const sorted = [...attendance].sort((a, b) => b.id - a.id).slice(0, 10);
    
    return sorted.map(a => {
      const student = students.find(s => s.id === a.student_id);
      const batch = batches.find(b => b.id === student?.preferred_batch);
      return {
        student_name: student?.full_name || 'Unknown Student',
        trainer_name: 'Trainer Bob',
        date: a.date,
        time: '10:15 AM', // Simulated
        status: a.status,
        batch_name: batch?.name || 'N/A'
      };
    });
  }
  const response = await client.get('/attendance/live-feed/');
  return response.data;
};

export const getAnnouncements = async () => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const user = JSON.parse(localStorage.getItem('user'));
    const announcements = getMockData('mock_announcements');
    
    if (user && user.role === 'student') {
      const students = getMockData('mock_students');
      const student = students.find(s => s.id === user.student_id);
      return announcements.filter(a => a.target_batch === null || a.target_batch === student?.preferred_batch);
    }
    return announcements;
  }
  const response = await client.get('/announcements/');
  return response.data;
};

export const createAnnouncement = async (announcementData) => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const announcements = getMockData('mock_announcements');
    const batches = getMockData('mock_batches');
    const students = getMockData('mock_students');
    
    const targetBatchId = announcementData.target_batch ? parseInt(announcementData.target_batch) : null;
    const targetBatchName = targetBatchId ? batches.find(b => b.id === targetBatchId)?.name : 'All';
    
    const newAnn = {
      id: announcements.length + 1,
      sender_name: 'Manager Director',
      title: announcementData.title,
      content: announcementData.content,
      target_batch: targetBatchId,
      target_batch_name: targetBatchName,
      created_at: new Date().toISOString()
    };
    announcements.unshift(newAnn);
    setMockData('mock_announcements', announcements);

    // Mock notify target student profiles
    const targetStudents = students.filter(s => s.status === 'approved' && (targetBatchId === null || s.preferred_batch === targetBatchId));
    
    targetStudents.forEach(s => {
      mockNotify(
        s.full_name,
        s.phone,
        s.email,
        `Driving School Alert: ${announcementData.title}`,
        announcementData.content
      );
    });

    return newAnn;
  }
  const response = await client.post('/announcements/', announcementData);
  return response.data;
};

export const getPayments = async () => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const user = JSON.parse(localStorage.getItem('user'));
    const payments = getMockData('mock_payments');
    if (user && user.role === 'student') {
      return payments.filter(p => p.student_id === user.student_id);
    }
    return payments;
  }
  const response = await client.get('/payments/');
  return response.data;
};

export const getStudentDashboard = async () => {
  await checkBackendStatus();
  if (isBackendOffline) {
    const user = JSON.parse(localStorage.getItem('user'));
    const students = getMockData('mock_students');
    const attendance = getMockData('mock_attendance');
    const payments = getMockData('mock_payments');
    const announcements = await getAnnouncements();
    
    const student = students.find(s => s.id === user.student_id);
    const completed = attendance.filter(a => a.student_id === student?.id && a.status === 'present').length;
    const total = 15;
    
    const payment = payments.find(p => p.student_id === student?.id) || { amount_due: 500, amount_paid: 0, status: 'unpaid' };
    
    const schedule = [
      { day: "Monday", topic: "Basic Vehicle Control & Steering", time: student?.preferred_batch === 1 ? "08:00 AM" : "05:00 PM" },
      { day: "Tuesday", topic: "Clutch Control & Gears shifting", time: student?.preferred_batch === 1 ? "08:00 AM" : "05:00 PM" },
      { day: "Wednesday", topic: "Reverse & Parallel Parking", time: student?.preferred_batch === 1 ? "08:00 AM" : "05:00 PM" },
      { day: "Thursday", topic: "Slope start & Traffic simulation", time: student?.preferred_batch === 1 ? "08:00 AM" : "05:00 PM" },
      { day: "Friday", topic: "Highway Driving & Night Simulation", time: student?.preferred_batch === 1 ? "08:00 AM" : "05:00 PM" }
    ];

    return {
      profile: student,
      progress: {
        completed,
        total,
        percentage: Math.round((completed / total) * 100)
      },
      payment: {
        status: payment.status.toUpperCase(),
        amount_due: payment.amount_due,
        amount_paid: payment.amount_paid,
        balance: payment.amount_due - payment.amount_paid
      },
      schedule,
      announcements: announcements.slice(0, 5)
    };
  }
  const response = await client.get('/dashboard/student/');
  return response.data;
};

export const getMockNotificationLogs = () => {
  return getMockData('mock_notifications');
};

export const clearMockNotificationLogs = () => {
  setMockData('mock_notifications', []);
};

export const changePassword = async (oldPassword, newPassword) => {
  await checkBackendStatus();
  if (isBackendOffline) {
    return { message: "Password updated successfully! (Mock Mode)" };
  }
  const response = await client.post('/change-password/', { old_password: oldPassword, new_password: newPassword });
  return response.data;
};

