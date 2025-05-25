import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App'
import CheckAccount from './pages/CheckAccount'
import ReportDetail from './pages/ReportDetail'
import Profile from "./pages/Profile";
import ReportHistory from "./pages/ReportHistory";
import CommentHistory from "./pages/CommentHistory";
import Report from "./pages/Report";
import Contact from "./pages/Contact";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ManageUsers from "./admin/ManageUsers";
import ManageComments from "./admin/ManageComments";
import ManageContacts from "./admin/ManageContacts";
import ManageReports from "./admin/ManageReports";
import AdminReportForm from "./admin/AdminReportForm ";
import AdminGuard from "./admin/AdminGuard";
import CheckWebsite from './pages/CheckWebsite';
import AiAnalysis from "./pages/AiAnalysis";
import AIGptAnalysis from "./pages/AIGptAnalysis";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/check-account" element={<CheckAccount />} />
        <Route path="/report/:id" element={<ReportDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/report-history" element={<ReportHistory />} />
        <Route path="/comment-history" element={<CommentHistory />} />
        <Route path="/report" element={<Report />} />
        <Route path="/contact" element={<Contact />} />
       <Route path="/admin" element={
          <AdminGuard><AdminLayout /></AdminGuard>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="comments" element={<ManageComments />} />
          <Route path="contacts" element={<ManageContacts />} />
          <Route path="reports" element={<ManageReports />} />
          <Route path="reports/new" element={<AdminReportForm />} />
          <Route path="reports/:id" element={<AdminReportForm />} />
        </Route>
        <Route path="/check-website" element={<CheckWebsite />} />
        <Route path="/ai-analysis" element={<AiAnalysis />} />
          <Route path="/ai-gpt-analysis" element={<AIGptAnalysis />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
