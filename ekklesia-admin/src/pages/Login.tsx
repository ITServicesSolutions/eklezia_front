import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import logo from '../assets/images/logo.jpeg';

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
  source?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone_number?: string;
  password: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credentials: LoginCredentials = {
        username: email,
        password,
        source: 'web',
      };

      const response = await loginUser(credentials);

      if (response.access_token) {
        localStorage.setItem('ekklesia-token', response.access_token);
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Echec de la connexion. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mb-5 flex justify-center sm:mb-6">
              <img src={logo} alt="logo" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
              Connexion EEAD-TU
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
              Accedez a votre espace d'administration
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block min-h-[48px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 transition-all duration-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block min-h-[48px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 transition-all duration-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Mot de passe oublie ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>

            <div className="pt-1 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pas encore de compte ?{' '}
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Creer un compte
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-6 text-center sm:mt-8">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              En vous connectant, vous acceptez nos conditions d'utilisation
            </p>
          </div>
        </div>

        <div className="mt-6 text-center sm:mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()}. Tous droits reserves.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
