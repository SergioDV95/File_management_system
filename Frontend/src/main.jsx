import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout from './Components/Layout'
import './tailwind.css'
import filesUp from './Components/Configs/Context'
import { useState } from 'react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
   <React.StrictMode>
      <App />
   </React.StrictMode>
);

function App() {
   const [filesUploaded, setFilesUploaded] = useState([]);
   return (
      <filesUp.Provider value={{filesUploaded, setFilesUploaded}}>
         <Layout />
      </filesUp.Provider>
   );
}
