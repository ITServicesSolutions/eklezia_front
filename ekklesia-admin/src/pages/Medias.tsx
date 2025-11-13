import React, { useEffect, useState } from 'react';
import { getMedias } from '../api/medias';

interface Media {
  id: number;
  type: 'image' | 'video';
  file_path: string;
  event_id: number;
  delete_user_id?: number | null;
  delete_date?: string | null;
  created_at: string;
  updated_at: string;
}

const Medias: React.FC = () => {
  const [medias, setMedias] = useState<Media[]>([]);

  useEffect(() => {
    const fetchMedias = async () => {
      try {
        const data = await getMedias();
        setMedias(data);
      } catch (error) {
        console.error('Failed to fetch medias', error);
      }
    };

    fetchMedias();
  }, []);

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Medias</h3>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                ID
              </th>
              <th scope="col" className="px-6 py-3">
                Type
              </th>
              <th scope="col" className="px-6 py-3">
                File Path
              </th>
              <th scope="col" className="px-6 py-3">
                Event ID
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {medias.map((media) => (
              <tr key={media.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {media.id}
                </th>
                <td className="px-6 py-4">
                  {media.type}
                </td>
                <td className="px-6 py-4">
                  {media.file_path}
                </td>
                <td className="px-6 py-4">
                  {media.event_id}
                </td>
                <td className="px-6 py-4">
                  {new Date(media.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Medias;
