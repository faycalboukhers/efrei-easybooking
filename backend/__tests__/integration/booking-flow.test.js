const request = require('supertest');
const app = require('../../server');

describe('Integration Tests - Complete Booking Flow', () => {
  let authToken;
  let userId;
  let testRoomId;

  // Test 1: Complete user registration flow
  test('1. Should register a new user successfully', async () => {
    const uniqueEmail = `integration${Date.now()}@test.com`;
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `intuser${Date.now()}`,
        email: uniqueEmail,
        password: 'testpass123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('id');

    authToken = response.body.token;
    userId = response.body.user.id;
  });

  // Test 2: Login with registered user
  test('2. Should login with the registered user', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `logintest${Date.now()}`,
        email: `logintest${Date.now()}@test.com`,
        password: 'password123'
      });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: signupRes.body.user.email,
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email');
  });

  // Test 3: Get all available rooms after authentication
  test('3. Should retrieve all rooms with authentication', async () => {
    const response = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    testRoomId = response.body[0].id;
  });

  // Test 4: Get room details
  test('4. Should get specific room details', async () => {
    const response = await request(app)
      .get(`/api/rooms/${testRoomId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', testRoomId);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('capacity');
  });

  // Test 5: Check room availability
  test('5. Should check room availability for a time slot', async () => {
    const response = await request(app)
      .post(`/api/rooms/${testRoomId}/check-availability`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        date: '2026-03-15',
        startTime: '09:00',
        endTime: '10:00'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('available');
    expect(typeof response.body.available).toBe('boolean');
  });

  // Test 6: Create a booking
  test('6. Should create a booking for an available room', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        date: '2026-03-15',
        startTime: '09:00',
        endTime: '10:00'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body.booking).toHaveProperty('id');
  });

  // Test 7: Verify booking appears in user's bookings
  test('7. Should see the booking in my bookings list', async () => {
    const response = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.some(b => b.room_id === testRoomId)).toBe(true);
  });

  // Test 8: Attempt to double book the same slot
  test('8. Should prevent double booking of the same time slot', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        date: '2026-03-15',
        startTime: '09:30',
        endTime: '10:30'
      });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error');
  });

  // Test 9: Book same room for different time slot
  test('9. Should allow booking same room for different time', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        date: '2026-03-15',
        startTime: '14:00',
        endTime: '15:00'
      });

    expect(response.status).toBe(201);
    expect(response.body.booking).toHaveProperty('id');
  });

  // Test 10: Cancel a booking
  test('10. Should cancel an existing booking', async () => {
    const bookingsRes = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${authToken}`);

    const activeBooking = bookingsRes.body.find(b => b.status === 'active');
    expect(activeBooking).toBeDefined();

    const response = await request(app)
      .delete(`/api/bookings/${activeBooking.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});

describe('Integration Tests - Error Handling and Edge Cases', () => {
  let authToken;

  beforeAll(async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `edgeuser${Date.now()}`,
        email: `edge${Date.now()}@test.com`,
        password: 'password123'
      });
    authToken = signupRes.body.token;
  });

  // Test 11: Access protected route without token
  test('11. Should deny access to rooms without authentication', async () => {
    const response = await request(app).get('/api/rooms');
    expect(response.status).toBe(401);
  });

  // Test 12: Access with invalid token
  test('12. Should reject invalid authentication token', async () => {
    const response = await request(app)
      .get('/api/rooms')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(403);
  });

  // Test 13: Create booking with missing data
  test('13. Should reject booking with missing required fields', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: 1,
        date: '2026-03-20'
      });

    expect(response.status).toBe(400);
  });

  // Test 14: Create booking with invalid time format
  test('14. Should reject booking with invalid time format', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: 1,
        date: '2026-03-20',
        startTime: 'invalid',
        endTime: 'invalid'
      });

    expect(response.status).toBe(400);
  });

  // Test 15: Get non-existent room
  test('15. Should return 404 for non-existent room', async () => {
    const response = await request(app)
      .get('/api/rooms/99999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
  });

  // Test 16: Cancel non-existent booking
  test('16. Should return 404 when cancelling non-existent booking', async () => {
    const response = await request(app)
      .delete('/api/bookings/99999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(404);
  });

  // Test 17: Filter rooms by capacity
  test('17. Should filter rooms by minimum capacity', async () => {
    const response = await request(app)
      .get('/api/rooms?capacity=30')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach(room => {
      expect(room.capacity).toBeGreaterThanOrEqual(30);
    });
  });

  // Test 18: Book with end time before start time
  test('18. Should reject booking where end time is before start time', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: 1,
        date: '2026-03-25',
        startTime: '15:00',
        endTime: '14:00'
      });

    expect(response.status).toBe(400);
  });

  // Test 19: Multiple users booking different rooms
  test('19. Should allow different users to book at same time', async () => {
    const user2Res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `user2${Date.now()}`,
        email: `user2${Date.now()}@test.com`,
        password: 'password123'
      });

    const user2Token = user2Res.body.token;

    const booking1 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: 1,
        date: '2026-04-01',
        startTime: '10:00',
        endTime: '11:00'
      });

    const booking2 = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        roomId: 2,
        date: '2026-04-01',
        startTime: '10:00',
        endTime: '11:00'
      });

    expect(booking1.status).toBe(201);
    expect(booking2.status).toBe(201);
  });

  // Test 20: Get all bookings (admin view)
  test('20. Should retrieve all bookings across users', async () => {
    const response = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});