import axiosInstance from './axiosInstance';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  new_password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone_number?: string;
  password: string;
}

export const requestPasswordReset = async (email: string) => {
  try {
    const response = await axiosInstance.post('/api/v1/auth/request-password-reset', { email });
    return response.data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await axiosInstance.post('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await axiosInstance.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Email ou mot de passe incorrect');
    } else if (error.response?.status === 404) {
      throw new Error('Endpoint non trouvé. Vérifiez l\'URL de l\'API.');
    } else {
      throw new Error('Échec de la connexion. Veuillez réessayer.');
    }
  }
};

export const registerUser = async (userData: RegisterData) => {
  try {
    const response = await axiosInstance.post('/api/v1/users/', userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Erreur lors de la création du compte');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/users/me');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Non authentifié');
    }
    throw new Error('Erreur lors de la récupération des informations utilisateur');
  }
};