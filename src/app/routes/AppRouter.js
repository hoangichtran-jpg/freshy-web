import { Fragment } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import RequireAuth from "../auth/RequireAuth";

import AppLayout from "../layout/AppLayout";

import { privateRoutes, publicRoutes } from "./routes.config";

/* ========================================
   Layout resolver
======================================== */

const getRouteLayout = (route) => {
  if (route.layout === null) {
    return Fragment;
  }

  return route.layout || AppLayout;
};

/* ========================================
   Route content
======================================== */

const renderRouteContent = (route) => {
  const Layout = getRouteLayout(route);

  const Page = route.component;

  return (
    <Layout>
      <Page />
    </Layout>
  );
};

/* ========================================
   App Router
======================================== */

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =================================
            Public routes
        ================================= */}

        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={renderRouteContent(route)}
          />
        ))}

        {/* =================================
            Private routes
        ================================= */}

        {privateRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<RequireAuth>{renderRouteContent(route)}</RequireAuth>}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
