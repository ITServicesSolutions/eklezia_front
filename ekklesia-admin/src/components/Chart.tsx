import React from 'react';

const Chart: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Chart</h4>
      <div className="flex items-center justify-center h-64 mt-4 bg-gray-100 rounded-md dark:bg-gray-700">
        <p className="text-gray-500">Chart will be displayed here</p>
      </div>
    </div>
  );
};

export default Chart;
