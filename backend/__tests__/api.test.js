const request = require('supertest');
const app = require('../server');

describe('API Tests - EasyBooking', () => {
  let authToken;
  let testUserId;
  let testRoomId;
  let testBookingId;

  // ========== TESTS UNITAIRES (10 tests) ==========

  describe('Unit Tests - Authentication', () => {
    test('UT-01: Should create user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: `user_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      authToken = response.body.token;
      testUserId = response.body.user.id;
    });

    test('UT-02: Should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });

    test('UT-03: Should require minimum password length', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('6 characters');
    });

    test('UT-04: Should login with valid credentials', async () => {
      const email = `login_${Date.now()}@example.com`;
      const password = 'password123';

      await request(app)
        .post('/api/auth/signup')
        .send({
          username: `loginuser_${Date.now()}`,
          email,
          password
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test('UT-05: Should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    test('UT-06: Should get rooms with authentication', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      testRoomId = response.body[0].id;
    });

    test('UT-07: Should reject access without token', async () => {
      const response = await request(app).get('/api/rooms');
      expect(response.status).toBe(401);
    });

    test('UT-08: Should create booking with valid data', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: testRoomId,
          date: '2026-06-15',
          startTime: '10:00',
          endTime: '11:00'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('booking');
      testBookingId = response.body.booking.id;
    });

    test('UT-09: Should prevent double booking', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: testRoomId,
          date: '2026-06-15',
          startTime: '10:30',
          endTime: '11:30'
        });

      expect(response.status).toBe(409);
    });

    test('UT-10: Should get user bookings', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // ========== TESTS D'INTÉGRATION (10 tests) ==========

  describe('Integration Tests - Complete Flows', () => {
    let integrationToken;
    let integrationRoomId;

    test('IT-01: Complete signup flow', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: `intuser_${Date.now()}`,
          email: `int_${Date.now()}@example.com`,
          password: 'testpass123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      integrationToken = response.body.token;
    });

    test('IT-02: Browse rooms after authentication', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${integrationToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      integrationRoomId = response.body[0].id;
    });

    test('IT-03: Check room availability', async () => {
      const response = await request(app)
        .post(`/api/rooms/${integrationRoomId}/check-availability`)
        .set('Authorization', `Bearer ${integrationToken}`)
        .send({
          date: '2026-07-01',
          startTime: '14:00',
          endTime: '15:00'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('available');
    });

    test('IT-04: Create booking successfully', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${integrationToken}`)
        .send({
          roomId: integrationRoomId,
          date: '2026-07-01',
          startTime: '14:00',
          endTime: '15:00'
        });

      expect(response.status).toBe(201);
    });

    test('IT-05: View created booking', async () => {
      const response = await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${integrationToken}`);

      expect(response.status).toBe(200);
      const booking = response.body.find(b => b.room_id === integrationRoomId);
      expect(booking).toBeDefined();
    });

    test('IT-06: Reject booking with missing data', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${integrationToken}`)
        .send({
          roomId: integrationRoomId,
          date: '2026-07-02'
        });

      expect(response.status).toBe(400);
    });

    test('IT-07: Reject booking with invalid time', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${integrationToken}`)
        .send({
          roomId: integrationRoomId,
          date: '2026-07-03',
          startTime: '15:00',
          endTime: '14:00'
        });

      expect(response.status).toBe(400);
    });

    test('IT-08: Filter rooms by capacity', async () => {
      const response = await request(app)
        .get('/api/rooms?capacity=30')
        .set('Authorization', `Bearer ${integrationToken}`);

      expect(response.status).toBe(200);
      response.body.forEach(room => {
        expect(room.capacity).toBeGreaterThanOrEqual(30);
      });
    });

    test('IT-09: Get room by ID', async () => {
      const response = await request(app)
        .get(`/api/rooms/${integrationRoomId}`)
        .set('Authorization', `Bearer ${integrationToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(integrationRoomId);
    });

    test('IT-10: Reject non-existent room', async () => {
      const response = await request(app)
        .get('/api/rooms/99999')
        .set('Authorization', `Bearer ${integrationToken}`);

      expect(response.status).toBe(404);
    });
  });

  // ========== TESTS DE PERFORMANCE (10 tests) ==========

  describe('Performance Tests', () => {
    let perfToken;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: `perfuser_${Date.now()}`,
          email: `perf_${Date.now()}@example.com`,
          password: 'password123'
        });
      perfToken = res.body.token;
    });

    test('PT-01: Signup completes within 2 seconds', async () => {
      const start = Date.now();
      await request(app)
        .post('/api/auth/signup')
        .send({
          username: `speeduser_${Date.now()}`,
          email: `speed_${Date.now()}@example.com`,
          password: 'password123'
        });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });

    test('PT-02: Login completes within 1 second', async () => {
      const email = `loginperf_${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/signup')
        .send({ username: `lp_${Date.now()}`, email, password: 'password123' });

      const start = Date.now();
      await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'password123' });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    test('PT-03: Get rooms completes within 500ms', async () => {
      const start = Date.now();
      await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${perfToken}`);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });

    test('PT-04: Create booking completes within 1 second', async () => {
      const start = Date.now();
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${perfToken}`)
        .send({
          roomId: 1,
          date: `2026-${8}-${Math.floor(Math.random() * 20) + 1}`,
          startTime: '10:00',
          endTime: '11:00'
        });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    test('PT-05: Get bookings completes within 500ms', async () => {
      const start = Date.now();
      await request(app)
        .get('/api/bookings/my-bookings')
        .set('Authorization', `Bearer ${perfToken}`);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });

    test('PT-06: Check availability completes within 500ms', async () => {
      const start = Date.now();
      await request(app)
        .post('/api/rooms/1/check-availability')
        .set('Authorization', `Bearer ${perfToken}`)
        .send({
          date: '2026-09-01',
          startTime: '10:00',
          endTime: '11:00'
        });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });

    test('PT-07: Handle 10 concurrent requests', async () => {
      const start = Date.now();
      const promises = Array(10).fill().map(() =>
        request(app)
          .get('/api/rooms')
          .set('Authorization', `Bearer ${perfToken}`)
      );
      await Promise.all(promises);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(3000);
    });

    test('PT-08: Filter rooms quickly', async () => {
      const start = Date.now();
      await request(app)
        .get('/api/rooms?capacity=20')
        .set('Authorization', `Bearer ${perfToken}`);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });

    test('PT-09: Get room by ID quickly', async () => {
      const start = Date.now();
      await request(app)
        .get('/api/rooms/1')
        .set('Authorization', `Bearer ${perfToken}`);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(300);
    });

    test('PT-10: Complete flow within 5 seconds', async () => {
      const start = Date.now();

      const signupRes = await request(app)
        .post('/api/auth/signup')
        .send({
          username: `flowuser_${Date.now()}`,
          email: `flow_${Date.now()}@example.com`,
          password: 'password123'
        });

      const token = signupRes.body.token;

      await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${token}`);

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roomId: 1,
          date: '2026-10-01',
          startTime: '10:00',
          endTime: '11:00'
        });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);
    });
  });

  // ========== TESTS DE SÉCURITÉ (10 tests) ==========

  describe('Security Tests - OWASP', () => {
    test('SEC-01: Prevent SQL injection in login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "admin' OR '1'='1",
          password: "admin' OR '1'='1"
        });

      expect(response.status).toBe(401);
    });

    test('SEC-02: Validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'not-an-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    test('SEC-03: Enforce password minimum length', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
    });

    test('SEC-04: Deny access without token', async () => {
      const response = await request(app).get('/api/rooms');
      expect(response.status).toBe(401);
    });

    test('SEC-05: Reject invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
    });

    test('SEC-06: Prevent unauthorized booking cancellation', async () => {
      const user1 = await request(app)
        .post('/api/auth/signup')
        .send({
          username: `sec1_${Date.now()}`,
          email: `sec1_${Date.now()}@example.com`,
          password: 'password123'
        });

      const user2 = await request(app)
        .post('/api/auth/signup')
        .send({
          username: `sec2_${Date.now()}`,
          email: `sec2_${Date.now()}@example.com`,
          password: 'password123'
        });

      const bookingRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${user1.body.token}`)
        .send({
          roomId: 1,
          date: '2026-11-01',
          startTime: '10:00',
          endTime: '11:00'
        });

      const bookingId = bookingRes.body.booking.id;

      const cancelRes = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${user2.body.token}`);

      expect(cancelRes.status).toBe(404);
    });

    test('SEC-07: Handle multiple failed login attempts', async () => {
      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@test.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(promises);
      responses.forEach(res => {
        expect(res.status).toBe(401);
      });
    });

    test('SEC-08: Validate booking time format', async () => {
      const token = authToken;
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roomId: 1,
          date: '2026-12-01',
          startTime: '25:00',
          endTime: '26:00'
        });

      expect(response.status).toBe(400);
    });

    test('SEC-09: Reject negative room IDs', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          roomId: -1,
          date: '2026-12-02',
          startTime: '10:00',
          endTime: '11:00'
        });

      expect(response.status).toBe(404);
    });

    test('SEC-10: Generic error messages', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/invalid credentials/i);
      expect(response.body.error).not.toMatch(/user not found/i);
    });
  });
});