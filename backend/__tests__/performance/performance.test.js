const request = require('supertest');
const app = require('../../server');

describe('Performance Tests', () => {
  let authToken;
  let testRoomId;

  beforeAll(async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `perfuser${Date.now()}`,
        email: `perf${Date.now()}@test.com`,
        password: 'password123'
      });
    authToken = signupRes.body.token;

    const roomsRes = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`);
    testRoomId = roomsRes.body[0].id;
  });

  // Test 1: Response time for authentication
  test('1. Signup should complete within 2 seconds', async () => {
    const startTime = Date.now();

    await request(app)
      .post('/api/auth/signup')
      .send({
        username: `speedtest${Date.now()}`,
        email: `speed${Date.now()}@test.com`,
        password: 'password123'
      });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(2000);
  });

  // Test 2: Response time for login
  test('2. Login should complete within 1 second', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `loginperf${Date.now()}`,
        email: `loginperf${Date.now()}@test.com`,
        password: 'password123'
      });

    const startTime = Date.now();

    await request(app)
      .post('/api/auth/login')
      .send({
        email: signupRes.body.user.email,
        password: 'password123'
      });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(1000);
  });

  // Test 3: Response time for getting rooms list
  test('3. Getting rooms list should complete within 500ms', async () => {
    const startTime = Date.now();

    await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(500);
  });

  // Test 4: Response time for checking room availability
  test('4. Checking availability should complete within 500ms', async () => {
    const startTime = Date.now();

    await request(app)
      .post(`/api/rooms/${testRoomId}/check-availability`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        date: '2026-05-01',
        startTime: '10:00',
        endTime: '11:00'
      });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(500);
  });

  // Test 5: Response time for creating booking
  test('5. Creating booking should complete within 1 second', async () => {
    const startTime = Date.now();

    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        date: `2026-05-${10 + Math.floor(Math.random() * 10)}`,
        startTime: '10:00',
        endTime: '11:00'
      });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(1000);
  });

  // Test 6: Concurrent room requests
  test('6. Should handle 50 concurrent room requests efficiently', async () => {
    const promises = [];
    const startTime = Date.now();

    for (let i = 0; i < 50; i++) {
      promises.push(
        request(app)
          .get('/api/rooms')
          .set('Authorization', `Bearer ${authToken}`)
      );
    }

    await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    expect(totalTime).toBeLessThan(5000);
  });

  // Test 7: Concurrent booking creation
  test('7. Should handle multiple bookings in parallel', async () => {
    const promises = [];
    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      promises.push(
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            roomId: testRoomId,
            date: `2026-06-${String(i + 1).padStart(2, '0')}`,
            startTime: '10:00',
            endTime: '11:00'
          })
      );
    }

    await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    expect(totalTime).toBeLessThan(3000);
  });

  // Test 8: Getting user bookings with multiple bookings
  test('8. Should retrieve bookings list within 500ms', async () => {
    const startTime = Date.now();

    await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${authToken}`);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(500);
  });

  // Test 9: Room filtering performance
  test('9. Filtering rooms should complete within 500ms', async () => {
    const startTime = Date.now();

    await request(app)
      .get('/api/rooms?capacity=20&available=true')
      .set('Authorization', `Bearer ${authToken}`);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(500);
  });

  // Test 10: Complete user flow performance
  test('10. Complete booking flow should complete within 5 seconds', async () => {
    const startTime = Date.now();

    // Signup
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        username: `flowtest${Date.now()}`,
        email: `flowtest${Date.now()}@test.com`,
        password: 'password123'
      });

    const token = signupRes.body.token;

    // Get rooms
    const roomsRes = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${token}`);

    const roomId = roomsRes.body[0].id;

    // Check availability
    await request(app)
      .post(`/api/rooms/${roomId}/check-availability`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2026-07-01',
        startTime: '10:00',
        endTime: '11:00'
      });

    // Create booking
    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        roomId: roomId,
        date: '2026-07-01',
        startTime: '10:00',
        endTime: '11:00'
      });

    // Get my bookings
    await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${token}`);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    expect(totalTime).toBeLessThan(5000);
  });
});