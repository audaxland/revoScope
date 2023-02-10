import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {FilesContextProvider} from "./store/FilesContext";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import {SettingsContextProvider} from "./store/SettingsContext";
import {ThemeProvider} from "@material-tailwind/react";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <SettingsContextProvider>
          <FilesContextProvider>
              <ThemeProvider>
                  <App />
              </ThemeProvider>
          </FilesContextProvider>
      </SettingsContextProvider>
  </React.StrictMode>
);

