import axiosInstance from './axiosInstance';

export interface Contribution {
  id: number;
  user_id: number;
  type: 'don' | 'offrande' | 'dime';
  amount: number;
  payment_method_id: number;
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  delete_user_id?: number;
  delete_date?: string;
}

export const getContributions = async (): Promise<Contribution[]> => {
  try {
    const response = await axiosInstance.get('/api/v1/contributions');
    return response.data;
  } catch (error) {
    console.error('Error fetching contributions:', error);
    throw error;
  }
};

export interface CreateContributionData {
  user_id: number;
  type: 'don' | 'offrande' | 'dime';
  amount: number;
  payment_method_id: number;
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
}

export const createContribution = async (data: CreateContributionData): Promise<Contribution> => {
  try {
    const response = await axiosInstance.post('/api/v1/contributions', data);
    return response.data;
  } catch (error) {
    console.error('Error creating contribution:', error);
    throw error;
  }
};
