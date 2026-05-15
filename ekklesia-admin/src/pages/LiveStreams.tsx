import React from 'react';

const LiveStreams: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Live Streams
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Bientôt disponible - Nous travaillons sur quelque chose d'exceptionnel
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center py-12">
          {/* Icône ou illustration */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 animate-pulse"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-lg">
              <svg 
                className="w-12 h-12 text-blue-600 dark:text-blue-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                />
              </svg>
            </div>
          </div>

          {/* Message principal */}
          <h4 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Fonctionnalité en cours de développement
          </h4>
          
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-8 leading-relaxed">
            Nous sommes en train de préparer une expérience de streaming live 
            immersive et de haute qualité. Soyez parmi les premiers à être 
            notifié quand nous lançons !
          </p>

          {/* Élément visuel supplémentaire */}
          <div className="flex space-x-2 mb-8">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${item * 0.2}s` }}
              ></div>
            ))}
          </div>

          {/* Bouton de notification */}
          <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Me notifier du lancement
          </button>
        </div>
      </div>

      {/* Section d'informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[
          {
            icon: "🎥",
            title: "Streaming HD",
            description: "Qualité optimale pour une expérience immersive"
          },
          {
            icon: "🔔",
            title: "Notifications",
            description: "Soyez alerté dès le lancement"
          },
          {
            icon: "🌐",
            title: "Accessible partout",
            description: "Disponible sur tous vos appareils"
          }
        ].map((feature, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveStreams;
