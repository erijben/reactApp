import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AuthContextProvider } from './authContexte/AuthContext'; // Make sure the path is correct

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider maxSnack={3} anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}>
        <AuthContextProvider>
        <App />
        </AuthContextProvider>
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>
);