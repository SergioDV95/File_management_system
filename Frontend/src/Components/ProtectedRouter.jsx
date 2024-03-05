import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import propTypes from "prop-types";

const ProtectedRouter = ({ children }) => {
  const [token] = useState(localStorage.getItem("token")) || null;

  const routers = {
    protected: [/^\/layout$/],
    public: [/^\/login$/, /^\/noPage$/],
  };
  const location = useLocation();
  const path = location.pathname;

  if (!token) {
    return <Navigate to="/login" state={{ from: path }} replace />;
  }

  if (token) {
    if (routers.protected.some((route) => route.test(path))) {
      return <>{children ? children : <Outlet />}</>;
    } else {
      return <Navigate to="/noPage" state={{ from: path }} replace />;
    }
  }
};

ProtectedRouter.propTypes = {
  children: propTypes.node,
};

export default ProtectedRouter;
