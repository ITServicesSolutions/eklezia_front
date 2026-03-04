import React, { useState, useEffect, useMemo } from 'react';
import {
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, Area, ScatterChart, Scatter,
  ZAxis
} from 'recharts';
import { parseDate } from '../utils/dateUtils';

// Types
type RawProgram = { 
  program_day?: string; 
  start_time?: string; 
  hours_start?: string;   // ← ajouté
};
type RawEvent = { start_date?: string; end_date?: string };
type RawContribution = {
  status: string; created_at?: string; type?: string; amount?: number 
};

type AdsDataPoint = { date: string; hour: number; name: string }; // hour est un entier (ex: 8 pour 08:00)
type ContributionsDataPoint = { name: string; dons: number; dîmes: number; offrandes: number };

const COLORS = {
  annonces: '#3b82f6',
  événements: '#10b981',
  durée: '#f59e0b',
  dons: '#6366f1',
  dîmes: '#34d399',
  offrandes: '#fbbf24',
};

// Formatteur d'axe : k pour millier, M pour million
const formatYAxis = (value: number | undefined) => {
  if (value === undefined) return '';
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

// Tooltip personnalisé pour les annonces (scatter)
const CustomAdTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data?.date) return null;
    const date = parseDate(data.date);
    const formattedDate = date ? date.toLocaleDateString('fr') : data.date;
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-sm font-medium">{formattedDate}</p>
        <p className="text-xs">Heure : {data.hour}h</p>
      </div>
    );
  }
  return null;
};

// Tooltip pour les contributions
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

// Tooltip pour les événements
const CustomEventTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    if (!label) return null;
    const date = parseDate(label);
    const formattedDate = date ? date.toLocaleDateString('fr') : label;
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-sm font-medium mb-2">{formattedDate}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.dataKey === 'événements') {
            return (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                Nombre d'événements : {entry.value}
              </p>
            );
          } else if (entry.dataKey === 'durée_moyenne') {
            return (
              <p key={index} className="text-xs" style={{ color: entry.color }}>
                Durée moyenne : {entry.value.toFixed(1)} h
              </p>
            );
          }
          return null;
        })}
      </div>
    );
  }
  return null;
};

// Récupération de l'heure (entière) depuis un champ time ou datetime
const getHourFromProgram = (prog: RawProgram): number | null => {
  // 1. Essayer hours_start (format "HH:MM:SS" ou "HH:MM")
  if (prog.hours_start) {
    const match = prog.hours_start.match(/^(\d{1,2}):/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  // 2. Essayer start_time (format "HH:MM:SS" ou "HH:MM")
  if (prog.start_time) {
    const match = prog.start_time.match(/^(\d{1,2}):/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  // 3. Sinon, utiliser program_day si c'est une date complète (peut contenir l'heure)
  if (prog.program_day) {
    const date = parseDate(prog.program_day);
    if (date) {
      // Si la date a une heure non nulle, on l'utilise
      if (date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0) {
        return date.getHours();
      }
      // Sinon, c'est probablement juste une date sans heure → on ne peut pas déterminer l'heure
    }
  }
  return null;
};

// Clé de jour au format YYYY-MM-DD
const getDayKey = (dateStr: string | undefined): string | null => {
  if (!dateStr) return null;
  const date = parseDate(dateStr);
  return date ? date.toISOString().split('T')[0] : null;
};

// Clé de mois pour les contributions (format "MMM YYYY" en anglais)
const getMonthKey = (dateStr: string | undefined): string | null => {
  if (!dateStr) return null;
  const date = parseDate(dateStr);
  return date ? date.toLocaleString('en', { month: 'short', year: 'numeric' }) : null;
};

// Tri par mois pour les contributions
const sortByMonth = (data: ContributionsDataPoint[]): ContributionsDataPoint[] => {
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
  // États pour les données brutes
  const [rawPrograms, setRawPrograms] = useState<RawProgram[]>([]);
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [rawContributions, setRawContributions] = useState<RawContribution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres de date
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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
        const baseURL = 'http://localhost:8000';

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

        setRawPrograms(Array.isArray(programs) ? programs : []);
        setRawEvents(Array.isArray(events) ? events : []);
        setRawContributions(Array.isArray(contributions) ? contributions : []);
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

  // Filtrage et agrégation des données en fonction des dates sélectionnées
  const filteredData = useMemo(() => {
    // Fonction utilitaire pour vérifier si une date est dans l'intervalle
    const isDateInRange = (dateStr: string | undefined): boolean => {
      if (!dateStr) return false;
      const date = parseDate(dateStr);
      if (!date) return false;
      const dateTime = date.getTime();
      const start = startDate ? new Date(startDate).getTime() : -Infinity;
      const end = endDate ? new Date(endDate).getTime() + 86400000 - 1 : Infinity; // fin de journée inclusive
      return dateTime >= start && dateTime <= end;
    };

    // ---- Programmes (annonces) ----
    const programsInRange = rawPrograms.filter(p => isDateInRange(p.program_day));
    const adsPoints: AdsDataPoint[] = [];
    programsInRange.forEach(prog => {
      const day = getDayKey(prog.program_day);
      const hour = getHourFromProgram(prog);
      if (day && hour !== null) {
        adsPoints.push({ date: day, hour, name: day });
      }
    });
    adsPoints.sort((a, b) => a.date.localeCompare(b.date));

    // ---- Événements ----
    const eventsInRange = rawEvents.filter(e => isDateInRange(e.start_date));
    const eventsByDay: Record<string, { count: number; totalDuration: number }> = {};
    eventsInRange.forEach(event => {
      const day = getDayKey(event.start_date);
      if (!day) return;

      // Guard against undefined start_date / end_date
      const start = event.start_date ? parseDate(event.start_date) : null;
      const end = event.end_date ? parseDate(event.end_date) : null;
      let duration = 0;
      if (start && end) {
        duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }

      if (!eventsByDay[day]) {
        eventsByDay[day] = { count: 0, totalDuration: 0 };
      }
      eventsByDay[day].count += 1;
      eventsByDay[day].totalDuration += duration;
    });

    let formattedEvents = Object.entries(eventsByDay).map(([name, { count, totalDuration }]) => ({
      name,
      événements: count,
      durée_moyenne: count > 0 ? totalDuration / count : 0,
    }));
    formattedEvents.sort((a, b) => a.name.localeCompare(b.name));

    // ---- Contributions ----
    const contribsInRange = rawContributions.filter(c => isDateInRange(c.created_at) && c.status === 'completed');
    const contribByMonth: Record<string, { dons: number; dîmes: number; offrandes: number }> = {};
    contribsInRange.forEach(contrib => {
      const month = getMonthKey(contrib.created_at);
      const type = contrib.type?.toLowerCase() || '';
      const amount = contrib.amount || 0;

      if (!month || !type || amount === 0) return;

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

    return {
      adsData: adsPoints,
      eventsData: formattedEvents,
      contributionsData: formattedContributions,
    };
  }, [rawPrograms, rawEvents, rawContributions, startDate, endDate]);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Tableau de bord
        </h3>
        {/* Filtres de date */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Du
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Au
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Première ligne : Annonces et Événements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Annonces */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Annonces par date et heure
          </h4>
          {filteredData.adsData.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-400">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 30, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  name="Date"
                  tickFormatter={(tick) => {
                  if (!tick) return '';
                  const date = parseDate(tick);
                  return date ? date.toLocaleDateString('fr', { day: '2-digit', month: 'short' }) : tick;
                  }}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Date', position: 'insideBottom', offset: -10, fill: '#6b7280' }}
                />
                <YAxis
                  dataKey="hour"
                  name="Heure"
                  domain={[0, 23]}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Heure', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                  ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]}
                />
                <ZAxis range={[50, 50]} />
                <Tooltip content={<CustomAdTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 20, paddingBottom: 0 }} />
                <Scatter name="Annonces" data={filteredData.adsData} fill={COLORS.annonces} shape="circle" />
                </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Événements */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">
            Événements (nombre et durée moyenne)
          </h4>
          {filteredData.eventsData.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-400">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={filteredData.eventsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tickFormatter={(tick) => {
                    if (!tick) return '';
                    const date = parseDate(tick);
                    return date ? date.toLocaleDateString('fr', { day: '2-digit', month: 'short' }) : tick;
                  }}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={formatYAxis}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: "Nombre d'événements", angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => value.toFixed(1) + ' h'}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  label={{ value: 'Durée moyenne (h)', angle: 90, position: 'insideRight', fill: '#6b7280', fontSize: 11 }}
                />
                <Tooltip content={<CustomEventTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar yAxisId="left" dataKey="événements" fill={COLORS.événements} barSize={20} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="durée_moyenne"
                  stroke={COLORS.durée}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: COLORS.durée }}
                  activeDot={{ r: 6 }}
                  name="Durée moyenne"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Deuxième ligne : Contributions */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">Contributions</h4>
        {filteredData.contributionsData.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-400">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={filteredData.contributionsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                label={{ value: 'Montant (F CFA)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip content={<CustomContribTooltip />} />
              <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ paddingBottom: 10 }} />
              <Area
                type="monotone"
                dataKey="dons"
                stroke={COLORS.dons}
                strokeWidth={2.5}
                fill={COLORS.dons}
                fillOpacity={0.1}
                dot={false}
                activeDot={{ r: 6, stroke: COLORS.dons, strokeWidth: 2, fill: '#fff' }}
                name="Dons"
              />
              <Line
                type="monotone"
                dataKey="dîmes"
                stroke={COLORS.dîmes}
                strokeWidth={2.5}
                dot={{ r: 3, fill: COLORS.dîmes, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: COLORS.dîmes, strokeWidth: 2, fill: '#fff' }}
                name="Dîmes"
              />
              <Line
                type="monotone"
                dataKey="offrandes"
                stroke={COLORS.offrandes}
                strokeWidth={2.5}
                dot={{ r: 3, fill: COLORS.offrandes, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: COLORS.offrandes, strokeWidth: 2, fill: '#fff' }}
                name="Offrandes"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;