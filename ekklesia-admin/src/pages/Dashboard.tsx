import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Types pour les données (à adapter selon la structure exacte de vos APIs)
type AdsData = { name: string; annonces: number }[];
type EventsData = { name: string; événements: number }[];
type MediaData = { name: string; value: number }[];
type ContributionsData = { name: string; dons: number; dîmes: number; offrandes: number }[];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
  const [adsData, setAdsData] = useState<AdsData>([]);
  const [eventsData, setEventsData] = useState<EventsData>([]);
  const [mediaData, setMediaData] = useState<MediaData>([]);
  const [contributionsData, setContributionsData] = useState<ContributionsData>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        // Récupérer le token
        const token = localStorage.getItem('ekklesia-token');

        if (!token) {
          throw new Error('Non authentifié. Veuillez vous reconnecter.');
        };

        const fetchOptions = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        const baseURL = 'http://eklezia.api.it-servicegroup.com';

        // Lancer toutes les requêtes en parallèle
        const [adsRes, eventsRes, contributionsRes] = await Promise.all([
          fetch(`${baseURL}/api/v1/programs/`, fetchOptions),
          fetch(`${baseURL}/api/v1/events/`, fetchOptions),
          fetch(`${baseURL}/api/v1/contributions/`, fetchOptions)
        ]);

        // Vérifier les statuts
        if (!adsRes.ok || !eventsRes.ok || !contributionsRes.ok) {
          throw new Error(`Erreur API: ${adsRes.status}`);
        }

        // Vérifier que la réponse est bien du JSON
        const contentType = adsRes.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('La réponse n\'est pas au format JSON');
        }

        // Extraire les données JSON
        const [ads, events, contributions] = await Promise.all([
          adsRes.json(),
          eventsRes.json(),
          contributionsRes.json(),
        ]);

        setAdsData(ads);
        setEventsData(events);
        setContributionsData(contributions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Tableau de bord
        </h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Tableau de bord
        </h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Tableau de bord
      </h3>

      {/* Grille des graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graphique des annonces */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Annonces
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={adsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="annonces" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique des événements */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Événements
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eventsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="événements" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique des coûts des contributions (stacked bar) */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Contributions (dons, dîmes, offrandes)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contributionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="dons" stackId="a" fill="#8884d8" />
              <Bar dataKey="dîmes" stackId="a" fill="#82ca9d" />
              <Bar dataKey="offrandes" stackId="a" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;