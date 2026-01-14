import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById, createBooking, checkAvailability } from '../services/api';
import './BookRoom.css';

function BookRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const response = await getRoomById(id);
      setRoom(response.data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement de la chambre');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
    setAvailabilityChecked(false);
    setError('');
    setSuccess('');
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bookingData.date || !bookingData.startTime || !bookingData.endTime) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (bookingData.startTime >= bookingData.endTime) {
      setError('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    try {
      const response = await checkAvailability(id, bookingData);
      setIsAvailable(response.data.available);
      setAvailabilityChecked(true);

      if (response.data.available) {
        setSuccess('La chambre est disponible pour ce créneau!');
      } else {
        setError('La chambre n\'est pas disponible pour ce créneau');
      }
    } catch (err) {
      setError('Erreur lors de la vérification de disponibilité');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!availabilityChecked) {
      setError('Veuillez d\'abord vérifier la disponibilité');
      return;
    }

    if (!isAvailable) {
      setError('La chambre n\'est pas disponible pour ce créneau');
      return;
    }

    try {
      await createBooking({
        roomId: id,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime
      });

      setSuccess('Réservation effectuée avec succès!');
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la réservation');
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (!room) return <div className="error">Chambre non trouvée</div>;

  return (
    <div className="book-room-container">
      <h1>Réserver: {room.name}</h1>

      <div className="room-info">
        <p>{room.description}</p>
        <p><strong>Capacité:</strong> {room.capacity} personnes</p>
        <div className="amenities">
          <strong>Équipements:</strong>
          <div className="amenities-list">
            {room.amenities.map((amenity, index) => (
              <span key={index} className="amenity-tag">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleCheckAvailability} className="booking-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={bookingData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startTime">Heure de début</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={bookingData.startTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">Heure de fin</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={bookingData.endTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-secondary">
            Vérifier la disponibilité
          </button>

          {availabilityChecked && isAvailable && (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
            >
              Confirmer la réservation
            </button>
          )}
        </div>
      </form>

      <button className="btn-link" onClick={() => navigate('/rooms')}>
        Retour aux chambres
      </button>
    </div>
  );
}

export default BookRoom;