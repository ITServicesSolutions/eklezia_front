import React, { useState } from 'react';

// Données initiales factices
const initialProgramsData = [
  {
    id: 1,
    title: 'Culte du Dimanche',
    host: 'Pasteur John Doe',
    schedule: 'Dimanche, 10:00 - 12:00',
  },
  {
    id: 2,
    title: 'Étude Biblique',
    host: 'Ancien Pierre',
    schedule: 'Mercredi, 19:00 - 20:30',
  },
  {
    id: 3,
    title: 'Prière du Matin',
    host: 'Diacre Jacques',
    schedule: 'Lundi au Vendredi, 06:00 - 07:00',
  },
];

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState(initialProgramsData);

  const handleDelete = (id: number) => {
    setPrograms(programs.filter(program => program.id !== id));
  };

  const handleAdd = () => {
    const newProgram = {
      id: Date.now(),
      title: `Nouveau Programme ${programs.length + 1}`,
      host: 'À annoncer',
      schedule: 'À déterminer',
    };
    setPrograms([...programs, newProgram]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Programmes</h3>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Ajouter un programme
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Titre du Programme</th>
              <th scope="col" className="px-6 py-3">Animateur</th>
              <th scope="col" className="px-6 py-3">Horaire</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{program.title}</td>
                <td className="px-6 py-4">{program.host}</td>
                <td className="px-6 py-4">{program.schedule}</td>
                <td className="px-6 py-4 text-right">
                  <button className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">Modifier</button>
                  <button
                    onClick={() => handleDelete(program.id)}
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

export default Programs;
