
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import CreateContract from "@/pages/CreateContract";
import Contracts from "@/pages/Contracts";
import Notifications from "@/pages/Notifications";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import BlogPosts from "@/pages/BlogPosts";
import AdminDashboard from "@/pages/AdminDashboard";
import Subscription from "@/pages/Subscription";
import Templates from "@/pages/Templates";
import BlogPost from "@/pages/BlogPost";
import "./App.css";

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/blog" element={<BlogPosts />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/modelos" element={<Templates />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/contratos" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
            <Route path="/dashboard/criar-contrato" element={<ProtectedRoute><CreateContract /></ProtectedRoute>} />
            <Route path="/dashboard/notificacoes" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/dashboard/assinatura" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            
            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </>
  );
}

export default App;
