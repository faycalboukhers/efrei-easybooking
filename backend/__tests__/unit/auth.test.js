const request = require('supertest');
const app = require('../../server');

describe('Unit Tests - Authentication', () => {
  // Test 1: Signup avec données valides
  test('should create a new user with valid data', async () => {
    const userData = {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'Password123'
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.username).toBe(userData.username);
  });

  it('should validate email format', async () => {
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

  it('should require minimum password length', async () => {
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

  it('should not allow duplicate emails', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    await request(app).post('/api/auth/signup').send(userData);

    const response = await request(app)
      .post('/api/signup')
      .send(userData);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});

describe('Room API Integration Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    token = response.body.token;
  });

  test('GET /api/rooms - should get all rooms', async () => {
    const response = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('should get room by ID', async () => {
    const response = await request(app)
      .get('/api/rooms/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
  });

  test('should check room availability', async () => {
    const response = await request(app)
      .post('/api/rooms/1/check-availability')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        date: '2026-02-01',
        startTime: '10:00',
        endTime: '11:00'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('available');
  });

  it('should filter rooms by capacity', async () => {
    const response = await request(app)
      .get('/api/rooms?capacity=20')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.data.forEach(room => {
      expect(room.capacity).toBeGreaterThanOrEqual(20);
    });
  });
});

// Test suite 2: Booking endpoints
describe('Booking API Integration Tests', () => {
  let token;
  let userId;
  let roomId;

  beforeAll(async () => {
    // Create a test user and login
    await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'testbooker',
        email: 'booking@test.com',
        password: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'booking@test.com',
        password: 'testpass'
      });

    token = loginRes.data.token;
  });

  it('should return 401 without token', async () => {
    const response = await request(app).get('/api/rooms');
    expect(response.status).toBe(401);
  });

  it('should return rooms with valid token', async () => {
    const response = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should filter rooms by capacity', async () => {
    const response = await request(app)
      .get('/api/rooms?capacity=20')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.data.forEach(room => {
      expect(room.capacity).toBeGreaterThanOrEqual(20);
    });
  });

  it('should get room by ID', async () => {
    const response = await request(app)
      .get('/api/rooms/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
  });

  // Test 10: Check room availability
  it('should check room availability', async () => {
    const response = await request(app)
      .post('/api/rooms/1/check-availability')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        date: '2026-01-20',
        startTime: '10:00',
        endTime: '11:00'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('available');
    expect(typeof response.body.available).toBe('boolean');
  });
});

// Test suite 2: Booking management tests (10 tests)
describe('Booking API Tests', () => {
  let authToken;
  let testRoomId;

  beforeAll(async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'bookinguser',
        email: 'booking@test.com',
        password: 'password123'
      });
    authToken = signupRes.body.token;

    const roomsRes = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`);
    testRoomId = roomsRes.body[0].id;
  });

  test('1. Should create a booking successfully', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        date: '2026-02-01',
        startTime: '10:00',
        endTime: '11:00'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body.booking).toHaveProperty('id');
  });

  test('2. Should prevent double booking', async () => {
    const bookingData = {
      roomId: testRoomId,
      date: '2026-02-01',
      startTime: '10:30',
      endTime: '11:30'
    };

    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(bookingData);

    expect(response.status).toBe(409);
  });

  test('3. Should get user bookings', async () => {
    const response = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('4. Should reject booking without authentication', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        roomId: testRoomId,
        date: '2026-02-05',
        startTime: '14:00',
        endTime: '15:00'
      });

    expect(response.status).toBe(401);
  });

  test('5. Should reject booking with invalid time format', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        date: '2026-02-05',
        startTime: '25:00',
        endTime: '26:00'
      });

    expect(response.status).toBe(400);
  });

  test('6. Should reject booking where end time is before start time', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        date: '2026-02-06',
        startTime: '15:00',
        endTime: '14:00'
      });

    expect(response.status).toBe(400);
  });

  test('7. Should reject booking with missing fields', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        date: '2026-02-07'
      });

    expect(response.status).toBe(400);
  });

  test('8. Should reject booking for non-existent room', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: 99999,
        date: '2026-02-08',
        startTime: '10:00',
        endTime: '11:00'
      });

    expect(response.status).toBe(404);
  });

  test('9. Should allow booking at different time for same room', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        date: '2026-02-01',
        startTime: '14:00',
        endTime: '15:00'
      });

    expect(response.status).toBe(201);
  });

  test('10. Should cancel a booking successfully', async () => {
    const bookingsRes = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${authToken}`);

    const bookingId = bookingsRes.body[0].id;

    const response = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});