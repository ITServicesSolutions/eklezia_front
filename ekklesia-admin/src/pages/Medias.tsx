import React, { useState } from 'react';

// Données initiales factices
const initialMediasData = [
  {
    id: 1,
    title: 'Média 1',
    imageUrl: 'https://via.placeholder.com/300',
    type: 'vidéo',
  },
  {
    id: 2,
    title: 'Média 2',
    imageUrl: 'https://via.placeholder.com/300',
    type: 'image',
  },
  {
    id: 3,
    title: 'Média 3',
    imageUrl: 'https://via.placeholder.com/300',
    type: 'audio',
  },
  {
    id: 4,
    title: 'Média 4',
    imageUrl: 'https://via.placeholder.com/300',
    type: 'vidéo',
  },
   {
    id: 5,
    title: 'Média 5',
    imageUrl: 'https://via.placeholder.com/300',
    type: 'vidéo',
  },
  {
    id: 6,
    title: 'Média 6',
    imageUrl: 'https://via.placeholder.com/300',
    type: 'image',
  },
];

const Medias: React.FC = () => {
  const [medias, setMedias] = useState(initialMediasData);

  const handleDelete = (id: number) => {
    setMedias(medias.filter(media => media.id !== id));
  };

  const handleAdd = () => {
    const newMedia = {
      id: Date.now(), // Utilise un timestamp pour un ID unique
      title: `Nouveau Média ${medias.length + 1}`,
      imageUrl: 'https://via.placeholder.com/300',
      type: 'image',
    };
    setMedias([...medias, newMedia]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Médiathèque</h3>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Ajouter un média
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {medias.map((media) => (
          <div key={media.id} className="bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden">
            <img src={media.imageUrl} alt={media.title} className="w-full h-48 object-cover"/>
            <div className="p-4">
              <h5 className="text-lg font-bold text-gray-900 dark:text-white">{media.title}</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{media.type}</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200">
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(media.id)}
                  className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Medias;
