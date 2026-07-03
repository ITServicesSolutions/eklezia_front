import axiosInstance from "./axiosInstance";

/**
 * Types de programme – interfaces correspondant aux schémas backend
 */

export interface ProgramTypeBase {
  name: string;
  description?: string;
}

export interface ProgramTypeCreate extends ProgramTypeBase {}

export interface ProgramTypeUpdate {
  name?: string;
  description?: string;
}

export interface ProgramType extends ProgramTypeBase {
  id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Récupère la liste de tous les types de programme (authentification requise)
 * @param skip - nombre d'éléments à sauter (pagination)
 * @param limit - nombre maximum d'éléments à retourner
 */
export const getProgramTypes = async (skip?: number, limit?: number): Promise<ProgramType[]> => {
  const params = new URLSearchParams();
  if (skip !== undefined) params.append('skip', skip.toString());
  if (limit !== undefined) params.append('limit', limit.toString());

  const response = await axiosInstance.get('/api/v1/program-types', { params });
  return response.data;
};

/**
 * Récupère un type de programme par son ID (authentification requise)
 */
export const getProgramType = async (id: number): Promise<ProgramType> => {
  const response = await axiosInstance.get(`/api/v1/program-types/${id}`);
  return response.data;
};

/**
 * Crée un nouveau type de programme (réservé aux admin/modérateur)
 */
export const createProgramType = async (data: ProgramTypeCreate): Promise<ProgramType> => {
  const response = await axiosInstance.post('/api/v1/program-types', data);
  return response.data;
};

/**
 * Remplace complètement un type de programme (PUT – admin/modérateur)
 */
export const updateProgramTypePut = async (id: number, data: ProgramTypeCreate): Promise<ProgramType> => {
  const response = await axiosInstance.put(`/api/v1/program-types/${id}`, data);
  return response.data;
};

/**
 * Met à jour partiellement un type de programme (PATCH – admin/modérateur)
 */
export const updateProgramTypePatch = async (id: number, data: ProgramTypeUpdate): Promise<ProgramType> => {
  const response = await axiosInstance.patch(`/api/v1/program-types/${id}`, data);
  return response.data;
};

/**
 * Supprime un type de programme (réservé aux administrateurs)
 */
export const deleteProgramType = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/program-types/${id}`);
};