const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Create a booking
router.post('/', authenticateToken, (req, res) => {
  const { roomId, date, startTime, endTime } = req.body;
  const userId = req.user.userId || req.user.id;

  if (!roomId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return res.status(400).json({ error: 'Invalid time format. Use HH:MM' });
  }

  // Check if end time is after start time
  if (startTime >= endTime) {
    return res.status(400).json({ error: 'End time must be after start time' });
  }

  // Check if room exists
  db.get('SELECT * FROM rooms WHERE id = ?', [roomId], (err, room) => {
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

    db.all(query, [roomId, date, endTime, startTime, endTime, endTime, startTime, endTime], (err, conflicts) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (conflicts.length > 0) {
        return res.status(409).json({ error: 'Room is already booked for this time slot' });
      }

      // Create booking
      db.run(
        'INSERT INTO bookings (user_id, room_id, booking_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
        [userId, roomId, date, startTime, endTime],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating booking' });
          }

          res.status(201).json({
            message: 'Booking created successfully',
            booking: {
              id: this.lastID,
              userId,
              roomId,
              date,
              startTime,
              endTime,
              status: 'active'
            }
          });
        }
      );
    });
  });
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, (req, res) => {
  const userId = req.user.userId || req.user.id;

  const query = `
    SELECT b.*, r.name as room_name, r.capacity
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC, b.start_time DESC
  `;

  db.all(query, [userId], (err, bookings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(bookings);
  });
});

// Get all bookings (admin feature - for testing)
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT b.*, r.name as room_name, u.username
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.booking_date DESC, b.start_time DESC
  `;

  db.all(query, [], (err, bookings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(bookings);
  });
});

// Cancel a booking
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId || req.user.id;

  // Check if booking exists and belongs to user
  db.get('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [id, userId], (err, booking) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    // Update status to cancelled
    db.run('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error cancelling booking' });
      }

      res.json({ message: 'Booking cancelled successfully' });
    });
  });
});

module.exports = router;