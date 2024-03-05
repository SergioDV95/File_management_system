import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./Pages/Layout";
import "./tailwind.css";
import ProtectedRouter from "./Components/ProtectedRouter";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Provider from "./Components/Provider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRouter />}>
          <Route path="/layout" element={<Provider />} />
          <Route path="/noPage" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
