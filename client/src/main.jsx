import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

// Pages
import App from './App';
import CheckAccount from './pages/CheckAccount';
import ReportDetail from './pages/ReportDetail';
import Profile from './pages/Profile';
import ReportHistory from './pages/ReportHistory';
import CommentHistory from './pages/CommentHistory';
import Report from './pages/Report';
import Contact from './pages/Contact';
import CheckWebsite from './pages/CheckWebsite';
import PhishingTestSelect from "./pages/PhishingTestSelect";
import PhishingGmailQuizFull from "./pages/PhishingTestDoing"; 
import TermsOfService from "./pages/TermsPage"; 
import AboutUs from "./pages/AboutUs"; 
import VisionStrategy from "./pages/VisionStrategy"; 
// Admin Pages
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import ManageUsers from './admin/ManageUsers';
import ManageComments from './admin/ManageComments';
import ManageContacts from './admin/ManageContacts';
import ManageReports from './admin/ManageReports';
import AdminReportForm from './admin/AdminReportForm';
import AdminGuard from './admin/AdminGuard';
import ManageCategories from './admin/ManageCategories';
import ManageTests from './admin/ManageTests';
import ManageQuestions from "./admin/ManageQuestions";
import AddQuestion from "./admin/AddQuestion";
import ManageUserResults from "./admin/ManageAnswerSessions";
import AnswerSessionDetail from './admin/AnswerSessionDetail'

// Components
import ChatbotModal from './components/ChatbotModal';
import ChatbotLauncher from './components/ChatbotLauncher';

// --- Auto check phiên đăng nhập mỗi 60s ---
function useAutoCheckAuth() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (!data.success) {
          localStorage.removeItem("user");
          localStorage.removeItem("auth-event");
          window.location.href = "#"; // hoặc navigate("/login");
        }
      } catch (err) {
        window.location.href = "#";
      }
    }, 60 * 1000); // mỗi 60 giây

    return () => clearInterval(interval);
  }, [navigate]);
}

// Wrapper cho toàn bộ app, tự động bảo vệ phiên đăng nhập
function AppWithChatbot() {
  useAutoCheckAuth();

  const location = useLocation();
  const [chatbotOpen, setChatbotOpen] = React.useState(false);
  const hideChatbot = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/check-account" element={<CheckAccount />} />
        <Route path="/report/:id" element={<ReportDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/report-history" element={<ReportHistory />} />
        <Route path="/comment-history" element={<CommentHistory />} />
        <Route path="/report" element={<Report />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/check-website" element={<CheckWebsite />} />
        <Route path="/phishing-test" element={<PhishingTestSelect />} />
        <Route path="/phishing-test/doing" element={<PhishingGmailQuizFull />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/vision" element={<VisionStrategy />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="comments" element={<ManageComments />} />
          <Route path="contacts" element={<ManageContacts />} />
          <Route path="reports" element={<ManageReports />} />
          <Route path="reports/new" element={<AdminReportForm />} />
          <Route path="reports/:id" element={<AdminReportForm />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="tests" element={<ManageTests />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="questions/new" element={<AddQuestion />} />
          <Route path="user-results" element={<ManageUserResults />} />
          <Route path="answer-sessions/detail" element={<AnswerSessionDetail />} />
        </Route>
      </Routes>

      {/* Chatbot */}
      {!hideChatbot && (
        <>
          <ChatbotLauncher onClick={() => setChatbotOpen(true)} />
          {chatbotOpen && <ChatbotModal open={chatbotOpen} onClose={() => setChatbotOpen(false)} />}
        </>
      )}
    </>
  );
}

// Mount to DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithChatbot />
    </BrowserRouter>
  </React.StrictMode>
);
