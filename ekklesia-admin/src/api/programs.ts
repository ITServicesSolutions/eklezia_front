import axiosInstance from './axiosInstance';

// Interfaces partagées
export interface ProgramType {
  id: number;
  name: string;
  description?: string;
}

export interface Program {
  id: number;
  program_day: string;
  hours_start: string;
  description: string;
  user_id: number;
  program_type_id: number;
  program_type?: ProgramType;
}

export interface CreateProgramData {
  program_day: string;
  hours_start: string;
  description: string;
  program_type_id: number;
}

// Récupérer tous les programmes
export const getPrograms = async (): Promise<Program[]> => {
  try {
    const response = await axiosInstance.get('/api/v1/programs');
    return response.data;
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }
};

// Créer un programme
export const createProgram = async (data: CreateProgramData): Promise<Program> => {
  try {
    const response = await axiosInstance.post('/api/v1/programs', data);
    return response.data;
  } catch (error) {
    console.error('Error creating program:', error);
    throw error;
  }
};

// Mettre à jour un programme (PATCH)
export const updateProgram = async (id: number, data: Partial<CreateProgramData>): Promise<Program> => {
  try {
    const response = await axiosInstance.patch(`/api/v1/programs/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating program:', error);
    throw error;
  }
};

// Supprimer un programme
export const deleteProgram = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/v1/programs/${id}`);
  } catch (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
};