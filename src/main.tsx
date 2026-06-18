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
import { RequireAuth } from "@/components/RequireAuth";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [
        { path: "/", element: <HomePage /> },
        {
          path: "/match",
          element: (
            <RequireAuth purpose="default">
              <AnalyzePage />
            </RequireAuth>
          ),
        },
        {
          path: "/report",
          element: (
            <RequireAuth purpose="default">
              <ReportPage />
            </RequireAuth>
          ),
        },
        {
          path: "/lobby",
          element: (
            <RequireAuth purpose="lobby">
              <LobbyPage />
            </RequireAuth>
          ),
        },
        {
          path: "/account",
          element: (
            <RequireAuth purpose="default">
              <AccountPage />
            </RequireAuth>
          ),
        },
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
