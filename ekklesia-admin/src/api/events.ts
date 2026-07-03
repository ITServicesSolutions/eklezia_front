import axiosInstance from './axiosInstance';

// Types correspondant aux schémas du backend
export interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  user_id: number;
}

export interface EventCreate {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

export interface EventUpdate {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Récupère la liste de tous les événements
 * GET /api/v1/events
 */
export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await axiosInstance.get('/api/v1/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Récupère un événement par son ID
 * GET /api/v1/events/{event_id}
 */
export const getEvent = async (id: number): Promise<Event> => {
  try {
    const response = await axiosInstance.get(`/api/v1/events/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    throw error;
  }
};

/**
 * Crée un nouvel événement
 * POST /api/v1/events
 */
export const createEvent = async (data: EventCreate): Promise<Event> => {
  try {
    const response = await axiosInstance.post('/api/v1/events', data);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Met à jour complètement un événement (PUT)
 * PUT /api/v1/events/{event_id}
 */
export const updateEventPut = async (id: number, data: EventCreate): Promise<Event> => {
  try {
    const response = await axiosInstance.put(`/api/v1/events/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating event with PUT:', error);
    throw error;
  }
};

/**
 * Met à jour partiellement un événement (PATCH)
 * PATCH /api/v1/events/{event_id}
 */
export const updateEventPatch = async (id: number, data: EventUpdate): Promise<Event> => {
  try {
    const response = await axiosInstance.patch(`/api/v1/events/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating event with PATCH:', error);
    throw error;
  }
};

/**
 * Supprime un événement
 * DELETE /api/v1/events/{event_id}
 */
export const deleteEvent = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/v1/events/${id}`);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Pour simplifier, on exporte par défaut la version PATCH
export const updateEvent = updateEventPatch;