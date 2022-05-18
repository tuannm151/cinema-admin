import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./css/style.scss";

import "./charts/ChartjsConfig";

// Import pages
import Dashboard from "./pages/Dashboard";
import AddingMovie from "./pages/AddingMovie/AddingMovie";
import EditMovie from "./pages/EditMovie";

import { ReactQueryDevtools } from "react-query/devtools";

import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]); // triggered on route change

  return (
    <QueryClientProvider client={queryClient}>
      <Helmet>
        <html lang="en" data-theme="light" />
      </Helmet>
      <Routes>
        <Route exact path="/" element={<Dashboard />} />
        <Route path="/movies/add-movie" element={<AddingMovie />} />
        <Route path="/movies/edit-movie/" element={<EditMovie />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
