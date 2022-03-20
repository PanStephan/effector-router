import React from 'react';
import ReactDOM from 'react-dom';
import { createNavigatorStore, Navigator } from "typed-router";
import './index.css';
import App from './App';
import { root } from "./routes/";
import reportWebVitals from './reportWebVitals';

export const navStore = createNavigatorStore();

ReactDOM.render(
  <React.StrictMode>
      <Navigator root={root} store={navStore}>
        <App />
      </Navigator>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
