import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart
} from 'recharts';
import { parseDate } from '../utils/dateUtils';

// Types
type AdsData = { name: string; annonces: number }[];
type EventsData = { name: string; événements: number }[];
type ContributionsData = { name: string; dons: number; dîmes: number; offrandes: number }[];

const COLORS = {
  annonces: '#3b82f6',
  événements: '#10b981',
  dons: '#8b5cf6',
  dîmes: '#10b981',
  offrandes: '#f59e0b',
};

// Couleurs plus douces pour les contributions
const CONTRIB_COLORS = {
  dons: '#6366f1',      // indigo
  dîmes: '#34d399',     // vert émeraude
  offrandes: '#fbbf24', // ambre
};

const formatYAxis = (value: number | undefined) => {
  if (value === undefined) return '';
  if (value >= 1e9) return (value / 1e9).toFixed(1) + ' Md';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + ' M';
  if (value >= 1e3) return (value / 1e3).toFixed(0) + ' k';
  return value.toString();
};

// Format monétaire pour le tooltip
const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return '';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Tooltip personnalisé pour les contributions
const CustomContribTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name} : {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Formatteur pour l'axe X des graphiques journaliers
const formatXAxisDay = (tickItem: string) => {
  const date = parseDate(tickItem);
  if (date) {
    return date.toLocaleString('fr', { day: '2-digit', month: 'short' });
  }
  return tickItem;
};

// Clé de jour au format YYYY-MM-DD (tri alphabétique = chronologique)
const getDayKey = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Sans date';
  const date = parseDate(dateStr);
  if (!date) return 'Sans date';
  return date.toISOString().split('T')[0];
};

// Clé de mois pour les contributions (format "MMM YYYY" en anglais)
const getMonthKey = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Sans date';
  const date = parseDate(dateStr);
  if (!date) return 'Sans date';
  return date.toLocaleString('en', { month: 'short', year: 'numeric' });
};

// Tri par date (les clés sont des chaînes ISO)
const sortByDate = <T extends { name: string }>(data: T[]): T[] => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
};

// Tri par mois (pour les contributions)
const sortByMonth = <T extends { name: string }>(data: T[]): T[] => {
  const monthOrder: Record<string, number> = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
  };
  return data.sort((a, b) => {
    const [monthA, yearA] = a.name.split(' ');
    const [monthB, yearB] = b.name.split(' ');
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
    return monthOrder[monthA] - monthOrder[monthB];
  });
};

const Dashboard: React.FC = () => {
  const [adsData, setAdsData] = useState<AdsData>([]);
  const [eventsData, setEventsData] = useState<EventsData>([]);
  const [contributionsData, setContributionsData] = useState<ContributionsData>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('ekklesia-token');
        if (!token) throw new Error('Non authentifié.');

        const fetchOptions = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };
        const baseURL = 'http://eklezia.api.it-servicegroup.com';

        const [adsRes, eventsRes, contributionsRes] = await Promise.all([
          fetch(`${baseURL}/api/v1/programs/`, fetchOptions),
          fetch(`${baseURL}/api/v1/events/`, fetchOptions),
          fetch(`${baseURL}/api/v1/contributions/`, fetchOptions)
        ]);

        if (!adsRes.ok || !eventsRes.ok || !contributionsRes.ok) {
          throw new Error('Erreur lors du chargement des données');
        }

        const programs = await adsRes.json();
        const events = await eventsRes.json();
        const contributions = await contributionsRes.json();

        // ---------- Programmes (annonces) : regroupement par jour ----------
        const programsByDay: Record<string, number> = {};
        programs.forEach((prog: any) => {
          const day = getDayKey(prog.program_day);
          if (day !== 'Sans date') {
            programsByDay[day] = (programsByDay[day] || 0) + 1;
          }
        });
        let formattedAds = Object.entries(programsByDay).map(([name, count]) => ({ name, annonces: count }));
        formattedAds = sortByDate(formattedAds);

        // ---------- Événements : regroupement par jour ----------
        const eventsByDay: Record<string, number> = {};
        events.forEach((event: any) => {
          const day = getDayKey(event.start_date);
          if (day !== 'Sans date') {
            eventsByDay[day] = (eventsByDay[day] || 0) + 1;
          }
        });
        let formattedEvents = Object.entries(eventsByDay).map(([name, count]) => ({ name, événements: count }));
        formattedEvents = sortByDate(formattedEvents);

        // ---------- Contributions : regroupement par mois ----------
        const contribByMonth: Record<string, { dons: number; dîmes: number; offrandes: number }> = {};
        contributions.forEach((contrib: any) => {
          const month = getMonthKey(contrib.created_at);
          const type = contrib.type?.toLowerCase() || '';
          const amount = contrib.amount || 0;

          if (!type || amount === 0) return;

          if (!contribByMonth[month]) {
            contribByMonth[month] = { dons: 0, dîmes: 0, offrandes: 0 };
          }

          if (type === 'don') {
            contribByMonth[month].dons += amount;
          } else if (type === 'dîme' || type === 'dime') {
            contribByMonth[month].dîmes += amount;
          } else if (type === 'offrande') {
            contribByMonth[month].offrandes += amount;
          }
        });
        let formattedContributions = Object.entries(contribByMonth).map(([name, values]) => ({
          name,
          ...values,
        }));
        formattedContributions = sortByMonth(formattedContributions);

        setAdsData(formattedAds);
        setEventsData(formattedEvents);
        setContributionsData(formattedContributions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
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

      {/* Première ligne : Annonces et Événements côte à côte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Annonces */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">Annonces</h4>
          {adsData.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-400">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={adsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tickFormatter={formatXAxisDay} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb' }} 
                  formatter={formatYAxis}
                  labelFormatter={(label) => {
                    const date = parseDate(label);
                    return date ? date.toLocaleDateString('fr') : label;
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="annonces" stroke={COLORS.annonces} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.annonces }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Événements */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">Événements</h4>
          {eventsData.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-400">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eventsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tickFormatter={formatXAxisDay} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb' }} 
                  formatter={formatYAxis}
                  labelFormatter={(label) => {
                    const date = parseDate(label);
                    return date ? date.toLocaleDateString('fr') : label;
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="événements" stroke={COLORS.événements} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.événements }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Deuxième ligne : Contributions (pleine largeur) avec double axe Y et design professionnel */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">Contributions</h4>
        {contributionsData.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-400">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={contributionsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {/* Grille plus discrète */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              {/* Axe gauche pour les dons */}
              <YAxis 
                yAxisId="left" 
                tickFormatter={formatYAxis} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                label={{ value: 'Dons (F CFA)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              />
              {/* Axe droit pour les dîmes et offrandes */}
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickFormatter={formatYAxis} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                label={{ value: 'Dîmes / Offrandes (F CFA)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip content={<CustomContribTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={40} 
                iconType="circle" 
                wrapperStyle={{ paddingBottom: 10 }}
              />
              {/* Lignes avec zones semi-transparentes */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="dons"
                stroke={CONTRIB_COLORS.dons}
                strokeWidth={2.5}
                fill={CONTRIB_COLORS.dons}
                fillOpacity={0.1}
                dot={false}
                activeDot={{ r: 6, stroke: CONTRIB_COLORS.dons, strokeWidth: 2, fill: '#fff' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="dîmes"
                stroke={CONTRIB_COLORS.dîmes}
                strokeWidth={2.5}
                dot={{ r: 3, fill: CONTRIB_COLORS.dîmes, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: CONTRIB_COLORS.dîmes, strokeWidth: 2, fill: '#fff' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="offrandes"
                stroke={CONTRIB_COLORS.offrandes}
                strokeWidth={2.5}
                dot={{ r: 3, fill: CONTRIB_COLORS.offrandes, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: CONTRIB_COLORS.offrandes, strokeWidth: 2, fill: '#fff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;