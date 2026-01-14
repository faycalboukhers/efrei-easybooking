const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all rooms (with optional filters)
router.get('/', authenticateToken, (req, res) => {
  const { capacity, available } = req.query;

  let query = 'SELECT * FROM rooms WHERE 1=1';
  const params = [];

  if (capacity) {
    query += ' AND capacity >= ?';
    params.push(parseInt(capacity));
  }

  if (available !== undefined) {
    query += ' AND available = ?';
    params.push(available === 'true' ? 1 : 0);
  }

  db.all(query, params, (err, rooms) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Parse amenities back to array
    const roomsWithAmenities = rooms.map(room => ({
      ...room,
      amenities: room.amenities ? room.amenities.split(',') : []
    }));

    res.json(roomsWithAmenities);
  });
});

// Get room by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, room) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    room.amenities = room.amenities ? room.amenities.split(',') : [];
    res.json(room);
  });
});

// Check room availability for specific date and time
router.post('/:id/check-availability', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { date, startTime, endTime } = req.body;

  if (!date || !startTime || !endTime) {
    return res.status(400).json({ error: 'Date, start time, and end time are required' });
  }

  // Check if room exists
  db.get('SELECT * FROM rooms WHERE id = ?', [id], (err, room) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check for conflicting bookings
    const query = `
      SELECT * FROM bookings
      WHERE room_id = ?
      AND booking_date = ?
      AND status = 'active'
      AND (
        (start_time < ? AND end_time > ?) OR
        (start_time < ? AND end_time > ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `;

    db.all(query, [id, date, endTime, startTime, endTime, endTime, startTime, endTime], (err, bookings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        available: bookings.length === 0,
        conflictingBookings: bookings.length
      });
    });
  });
});

module.exports = router;