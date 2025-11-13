import React, { useEffect, useState } from 'react';
import { getMedias, createMedia } from '../api/medias';

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
  const [eventId, setEventId] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);

  const fetchMedias = async () => {
    try {
      const data = await getMedias();
      setMedias(data);
    } catch (error) {
      console.error('Failed to fetch medias', error);
    }
  };

  useEffect(() => {
    fetchMedias();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !eventId) {
      alert('Please provide both an event ID and a file.');
      return;
    }

    try {
      await createMedia(eventId, file);
      setEventId(0);
      setFile(null);
      fetchMedias(); // Refresh the list
    } catch (error) {
      console.error('Failed to create media', error);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Upload Media</h3>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label htmlFor="event_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Event ID</label>
            <input type="number" id="event_id" value={eventId} onChange={(e) => setEventId(parseInt(e.target.value))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="1" required />
          </div>
          <div>
            <label htmlFor="file_input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Upload file</label>
            <input onChange={handleFileChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file" required/>
          </div>
        </div>
        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
      </form>

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
