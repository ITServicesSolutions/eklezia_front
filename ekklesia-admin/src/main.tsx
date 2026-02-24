import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createSlice, configureStore } from '@reduxjs/toolkit';
import App from './App';
import './index.css';

// A minimal Redux store setup. In a real app, you'd have reducers.
const counterSlice = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {},
});

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
