import React, { useEffect, useState } from 'react';
import { getContributions, createContribution } from '../api/contributions';

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

export interface CreateContributionData {
  user_id: number;
  type: 'don' | 'offrande' | 'dime';
  amount: number;
  payment_method_id: number;
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed';
}

const Contributions: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState<'don' | 'offrande' | 'dime'>('don');
  const [amount, setAmount] = useState(0);
  const [paymentMethodId, setPaymentMethodId] = useState(0);
  const [userId, setUserId] = useState(0); // Ajout d'un champ pour user_id

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const data = await getContributions();
      setContributions(data);
    } catch (err) {
      setError('Failed to fetch contributions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (userId === 0 || paymentMethodId === 0 || amount <= 0) {
      setError('Please fill all required fields with valid values');
      return;
    }

    const newContribution: CreateContributionData = {
      user_id: userId,
      type,
      amount,
      payment_method_id: paymentMethodId,
      transaction_id: `txn_${Date.now()}`,
      status: 'pending',
    };
    
    try {
      await createContribution(newContribution);
      // Reset form
      setUserId(0);
      setAmount(0);
      setPaymentMethodId(0);
      setType('don');
      setError(null);
      fetchContributions(); // Refetch contributions after creating a new one
    } catch (err) {
      setError('Failed to create contribution');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contributions</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Add Contribution</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                User ID *
              </label>
              <input
                type="number"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(Number(e.target.value))}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                min="1"
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Type *
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'don' | 'offrande' | 'dime')}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="don">Don</option>
                <option value="offrande">Offrande</option>
                <option value="dime">Dime</option>
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                min="0.01"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="paymentMethodId" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Payment Method ID *
              </label>
              <input
                type="number"
                id="paymentMethodId"
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(Number(e.target.value))}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                min="1"
              />
            </div>
          </div>
          <div className="mt-4">
            <button type="submit" className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Add</button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b dark:border-gray-700">Type</th>
              <th className="py-2 px-4 border-b dark:border-gray-700">Amount</th>
              <th className="py-2 px-4 border-b dark:border-gray-700">Payment Method ID</th>
              <th className="py-2 px-4 border-b dark:border-gray-700">Status</th>
              <th className="py-2 px-4 border-b dark:border-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((contribution) => (
              <tr key={contribution.id}>
                <td className="py-2 px-4 border-b dark:border-gray-700">{contribution.type}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700">{contribution.amount}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700">{contribution.payment_method_id}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700">{contribution.status}</td>
                <td className="py-2 px-4 border-b dark:border-gray-700">{new Date(contribution.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contributions;