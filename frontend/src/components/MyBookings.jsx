import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../services/api';
import './MyBookings.css';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getMyBookings();
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des réservations');
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation?')) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      setSuccess('Réservation annulée avec succès');
      fetchBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de l\'annulation de la réservation');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="my-bookings-container">
      <h1>Mes réservations</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {bookings.length === 0 ? (
        <p className="no-bookings">Vous n'avez aucune réservation</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`booking-card ${booking.status === 'cancelled' ? 'cancelled' : ''}`}
            >
              <div className="booking-header">
                <h3>{booking.room_name}</h3>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status === 'active' ? 'Active' : 'Annulée'}
                </span>
              </div>

              <div className="booking-details">
                <p>
                  <strong>Date:</strong> {formatDate(booking.booking_date)}
                </p>
                <p>
                  <strong>Horaire:</strong> {booking.start_time} - {booking.end_time}
                </p>
                <p>
                  <strong>Capacité:</strong> {booking.capacity} personnes
                </p>
                <p className="booking-created">
                  Réservé le {formatDate(booking.created_at)}
                </p>
              </div>

              {booking.status === 'active' && (
                <button
                  className="btn-danger"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  Annuler la réservation
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;