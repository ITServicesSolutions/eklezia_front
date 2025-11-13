import axiosInstance from './axiosInstance';

export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
}

export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get('/api/v1/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const createEvent = async (data: Omit<Event, 'id'>): Promise<Event> => {
  try {
    const response = await axiosInstance.post('/api/v1/events', data);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/v1/events/${id}`);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};
