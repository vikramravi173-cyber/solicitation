import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import { AppLayout } from "@/components/AppLayout";
import { HomePage } from "@/pages/Home";
import { AnalyzePage } from "@/pages/Analyze";
import { ReportPage } from "@/pages/Report";

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
      ],
    },
  ],
  { basename },
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
