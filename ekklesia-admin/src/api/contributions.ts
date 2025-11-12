import axiosInstance from './axiosInstance';

export const getContributions = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get('/api/v1/contributions');
    return response.data;
  } catch (error) {
    console.error('Error fetching contributions:', error);
    throw error;
  }
};

export const createContribution = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post('/api/v1/contributions', data);
    return response.data;
  } catch (error) {
    console.error('Error creating contribution:', error);
    throw error;
  }
};