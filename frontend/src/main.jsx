import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import AppContextProvider from './context/AppContext.jsx';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <HelmetProvider>
          <AppContextProvider>
            <App />
            <ToastContainer 
              position="top-right" 
              autoClose={5000} 
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </AppContextProvider>
        </HelmetProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
