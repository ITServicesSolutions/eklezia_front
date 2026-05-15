import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color?: 'purple' | 'blue' | 'green' | 'orange';
}

const colorMap: Record<NonNullable<CardProps['color']>, string> = {
  purple: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
  blue:   'linear-gradient(135deg, #3b82f6, #60a5fa)',
  green:  'linear-gradient(135deg, #48bb78, #68d391)',
  orange: 'linear-gradient(135deg, #ed8936, #f6ad55)',
};

const Card: React.FC<CardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'purple',
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="neo-card p-6 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        {/* Icône colorée */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
          style={{ background: colorMap[color], boxShadow: '4px 4px 8px #c5ccd4, -2px -2px 6px #ffffff' }}
        >
          {icon}
        </div>

        {/* Trend badge */}
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              trend.positive
                ? 'text-neo-success'
                : 'text-neo-error'
            }`}
            style={{
              background: trend.positive
                ? 'rgba(72, 187, 120, 0.12)'
                : 'rgba(252, 92, 125, 0.12)',
            }}
          >
            {trend.positive
              ? <TrendingUp size={13} />
              : <TrendingDown size={13} />
            }
            {trend.positive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>

      {/* Valeur + titre */}
      <div>
        <p className="text-3xl font-bold text-neo-text leading-none mb-1">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </p>
        <p className="text-sm text-neo-text-secondary font-medium">{title}</p>
      </div>
    </motion.div>
  );
};

export default Card;
