import React, { useState, useEffect } from 'react';
import { getPrograms, createProgram, deleteProgram, Program } from '../api/programs';

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await getPrograms();
        setPrograms(data);
      } catch (error) {
        console.error('Failed to fetch programs', error);
      }
    };

    fetchPrograms();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteProgram(id);
      setPrograms(programs.filter(program => program.id !== id));
    } catch (error) {
      console.error('Failed to delete program', error);
    }
  };

  const handleAdd = async () => {
    const newProgramData = {
      name: `Nouveau Programme ${programs.length + 1}`,
      description: 'Description à venir',
      day: 'À déterminer',
      time: 'À déterminer',
    };
    try {
      const newProgram = await createProgram(newProgramData);
      setPrograms([...programs, newProgram]);
    } catch (error) {
      console.error('Failed to add program', error);
    }
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
              <th scope="col" className="px-6 py-3">Description</th>
              <th scope="col" className="px-6 py-3">Jour</th>
              <th scope="col" className="px-6 py-3">Heure</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{program.name}</td>
                <td className="px-6 py-4">{program.description}</td>
                <td className="px-6 py-4">{program.day}</td>
                <td className="px-6 py-4">{program.time}</td>
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
