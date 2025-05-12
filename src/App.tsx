
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
import Blog from "@/pages/Blog";
import "./App.css";
import Models from "./pages/Models";
import Contact from "./pages/Contact";
import NewPost from "@/pages/admin/posts/New";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Terms from "@/pages/Terms";
import Privacy from "./pages/Privacy";
import LGPD from "./pages/LGPD";
import SignaturePage from "./pages/signature/[id]";

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/modelos" element={<Models />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/contratos" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
            <Route path="/dashboard/criar-contrato" element={<ProtectedRoute><CreateContract /></ProtectedRoute>} />
            <Route path="/dashboard/notificacoes" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/dashboard/assinatura" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            {/* Move blog management to admin section */}
            <Route path="/admin/blog" element={<ProtectedRoute adminOnly><BlogPosts /></ProtectedRoute>} />
            <Route path="/admin/posts/new" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />
            
            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
            <Route path="/contato" element={<Contact />}/>
            <Route path="/sobre" element={<About />}/>
            <Route path="/faq" element={<FAQ />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/lgpd" element={<LGPD />} />
            <Route path="/signature/:id" element={<SignaturePage />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </>
  );
}

export default App;
