import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms } from '../services/api';
import './RoomList.css';

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    capacity: '',
    available: 'true'
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await getRooms(filters);
      setRooms(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des chambres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleBookRoom = (roomId) => {
    navigate(`/book/${roomId}`);
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="room-list-container">
      <h1>Chambres disponibles</h1>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="capacity">Capacité minimale:</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={filters.capacity}
            onChange={handleFilterChange}
            placeholder="Ex: 10"
            min="0"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {rooms.length === 0 ? (
        <p className="no-rooms">Aucune chambre disponible</p>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div key={room.id} className="room-card">
              <h3>{room.name}</h3>
              <p className="room-description">{room.description}</p>
              <div className="room-details">
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
              <button
                className="btn-primary"
                onClick={() => handleBookRoom(room.id)}
              >
                Réserver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoomList;