import React, { useState } from 'react';

// Données initiales factices
const initialEventsData = [
  {
    id: 1,
    name: 'Conférence Annuelle',
    date: '2024-12-15',
    location: 'Grand Auditorium',
  },
  {
    id: 2,
    name: 'Séminaire Jeunesse',
    date: '2024-11-20',
    location: 'Salle de Conférence B',
  },
  {
    id: 3,
    name: 'Concert de Louange',
    date: '2024-11-28',
    location: 'Sanctuaire Principal',
  },
];

const Events: React.FC = () => {
  const [events, setEvents] = useState(initialEventsData);

  const handleDelete = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const handleAdd = () => {
    const newEvent = {
      id: Date.now(),
      name: `Nouvel Événement ${events.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      location: 'À définir',
    };
    setEvents([...events, newEvent]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Événements</h3>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Ajouter un événement
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Nom de l'événement</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Lieu</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{event.name}</td>
                <td className="px-6 py-4">{event.date}</td>
                <td className="px-6 py-4">{event.location}</td>
                <td className="px-6 py-4 text-right">
                  <button className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">Modifier</button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="font-medium text-red-600 dark:text-red-500 hover:underline ml-4"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Events;
