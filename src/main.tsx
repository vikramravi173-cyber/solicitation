import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "@/lib/supabase/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { HomePage } from "@/pages/Home";
import { AnalyzePage } from "@/pages/Analyze";
import { ReportPage } from "@/pages/Report";
import { LobbyPage } from "@/pages/Lobby";
import { AccountPage } from "@/pages/Account";

// Mounts under the GitHub Pages project base in production, "/" in dev.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [
        { path: "/", element: <HomePage /> },
        { path: "/match", element: <AnalyzePage /> },
        { path: "/report", element: <ReportPage /> },
        { path: "/lobby", element: <LobbyPage /> },
        { path: "/account", element: <AccountPage /> },
      ],
    },
  ],
  { basename },
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
