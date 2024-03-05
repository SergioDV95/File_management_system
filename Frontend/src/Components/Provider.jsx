import React from "react";
import filesUp from "./Configs/Context";
import Layout from "./../Pages/Layout";
import { useState } from "react";

const Provider = () => {
  const [filesUploaded, setFilesUploaded] = useState([]);
  return (
    <filesUp.Provider value={{ filesUploaded, setFilesUploaded }}>
      <Layout />
    </filesUp.Provider>
  );
};

export default Provider;
