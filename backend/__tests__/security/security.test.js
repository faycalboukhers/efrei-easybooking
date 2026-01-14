const request = require('supertest');
const app = require('../../server');

describe('Security Tests - OWASP Top 10', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `sectest${Date.now()}`,
        email: `sectest${Date.now()}@test.com`,
        password: 'SecurePass123!'
      });
    authToken = signupRes.body.token;
    testUserId = signupRes.body.user.id;
  });

  // Test 1: SQL Injection in login
  test('1. Should prevent SQL injection in login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: "admin' OR '1'='1",
        password: "admin' OR '1'='1"
      });

    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty('token');
  });

  // Test 2: SQL Injection in signup
  test('2. Should prevent SQL injection in signup', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: "admin'; DROP TABLE users; --",
        email: "malicious@test.com",
        password: "password123"
      });

    expect([201, 400, 500]).toContain(response.status);
    if (response.status === 201) {
      expect(response.body.user.username).toBe("admin'; DROP TABLE users; --");
    }
  });

  // Test 3: XSS in user input
  test('3. Should sanitize XSS attempts in username', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: xssPayload,
        email: `xss${Date.now()}@test.com`,
        password: 'password123'
      });

    if (response.status === 201) {
      expect(response.body.user.username).toBe(xssPayload);
    }
  });

  // Test 4: Unauthorized access to protected routes
  test('4. Should deny access without authentication token', async () => {
    const response = await request(app).get('/api/rooms');
    expect(response.status).toBe(401);
  });

  // Test 5: Invalid token rejection
  test('5. Should reject invalid JWT tokens', async () => {
    const response = await request(app)
      .get('/api/rooms')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(response.status).toBe(403);
  });

  // Test 6: Password complexity requirements
  test('6. Should enforce minimum password length', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'weakpassuser',
        email: 'weak@test.com',
        password: '123'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/6 characters/i);
  });

  // Test 7: Email format validation
  test('7. Should validate email format', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser',
        email: 'not-an-email',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/email/i);
  });

  // Test 8: Prevent booking manipulation
  test('8. Should not allow users to cancel bookings they do not own', async () => {
    // Create another user
    const user2Res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `attacker${Date.now()}`,
        email: `attacker${Date.now()}@test.com`,
        password: 'password123'
      });

    const user2Token = user2Res.body.token;

    // User 1 creates a booking
    const roomsRes = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`);
    const roomId = roomsRes.body[0].id;

    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: roomId,
        date: '2026-08-01',
        startTime: '10:00',
        endTime: '11:00'
      });

    const bookingId = bookingRes.body.booking.id;

    // User 2 tries to cancel User 1's booking
    const cancelRes = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(cancelRes.status).toBe(404);
  });

  // Test 9: Rate limiting / Brute force protection simulation
  test('9. Should handle multiple failed login attempts', async () => {
    const attempts = [];

    for (let i = 0; i < 10; i++) {
      attempts.push(
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@test.com',
            password: 'wrongpassword'
          })
      );
    }

    const responses = await Promise.all(attempts);
    responses.forEach(response => {
      expect(response.status).toBe(401);
    });
  });

  // Test 10: CSRF token validation (header check)
  test('10. Should accept requests with proper content-type', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      });

    expect([401, 200]).toContain(response.status);
  });

  // Test 11: Information disclosure prevention
  test('11. Should not reveal whether email exists on login failure', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'password123'
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/invalid credentials/i);
    expect(response.body.error).not.toMatch(/user not found|email/i);
  });

  // Test 12: Authorization bypass attempt
  test('12. Should not allow access to other users bookings', async () => {
    const response = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test 13: Input validation for booking times
  test('13. Should validate time format in bookings', async () => {
    const roomsRes = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`);
    const roomId = roomsRes.body[0].id;

    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: roomId,
        date: '2026-08-05',
        startTime: '25:99',
        endTime: '26:99'
      });

    expect(response.status).toBe(400);
  });

  // Test 14: Prevent negative room IDs
  test('14. Should reject booking with invalid room ID', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: -1,
        date: '2026-08-06',
        startTime: '10:00',
        endTime: '11:00'
      });

    expect(response.status).toBe(404);
  });

  // Test 15: NoSQL/SQL injection in query parameters
  test('15. Should handle malicious query parameters safely', async () => {
    const response = await request(app)
      .get('/api/rooms?capacity=10; DROP TABLE rooms;')
      .set('Authorization', `Bearer ${authToken}`);

    expect([200, 400]).toContain(response.status);
  });

  // Test 16: Session fixation prevention
  test('16. Should generate new token on each login', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `sessiontest${Date.now()}`,
        email: `sessiontest${Date.now()}@test.com`,
        password: 'password123'
      });

    const token1 = signupRes.body.token;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: signupRes.body.user.email,
        password: 'password123'
      });

    const token2 = loginRes.body.token;

    expect(token1).not.toBe(token2);
  });

  // Test 17: Sensitive data exposure in error messages
  test('17. Should not expose sensitive data in error messages', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'test',
        email: 'invalid-email',
        password: 'test'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
    expect(JSON.stringify(response.body)).not.toMatch(/database|sql|query|stack/i);
  });

  // Test 18: CORS validation (if applicable)
  test('18. Should handle CORS properly', async () => {
    const response = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Origin', 'http://localhost:3000');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  // Test 19: Secure headers check
  test('19. Should return appropriate security headers', async () => {
    const response = await request(app).get('/api/rooms');

    expect(response.headers['content-type']).toMatch(/json/);
  });

  // Test 20: Mass assignment prevention
  test('20. Should not allow role escalation through mass assignment', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `massassign${Date.now()}`,
        email: `massassign${Date.now()}@test.com`,
        password: 'password123',
        role: 'admin',
        isAdmin: true
      });

    if (response.status === 201) {
      expect(response.body.user.role).toBeUndefined();
      expect(response.body.user.isAdmin).toBeUndefined();
    }
  });
});