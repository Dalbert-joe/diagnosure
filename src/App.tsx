import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Core Pages
import SplashScreen from "./pages/SplashScreen";
import RoleSelection from "./pages/RoleSelection";
import PatientLogin from "./pages/PatientLogin";
import PatientSignup from "./pages/PatientSignup";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorSignup from "./pages/DoctorSignup";
import PatientDashboard from "./pages/PatientDashboard";
import ChatBot from "./pages/ChatBot";
import Diagnosis from "./pages/Diagnosis";
import HospitalBooking from "./pages/HospitalBooking";
import PatientProfile from "./pages/PatientProfile";
import DoctorDashboard from "./pages/DoctorDashboard";
import NotFound from "./pages/NotFound";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { AppDataProvider } from "./contexts/AppDataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppDataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Core Flow */}
              <Route path="/" element={<SplashScreen />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              
              {/* Patient Authentication */}
              <Route path="/patient/login" element={<PatientLogin />} />
              <Route path="/patient/signup" element={<PatientSignup />} />
              
              {/* Doctor Authentication */}
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/signup" element={<DoctorSignup />} />
              
              {/* Patient Flow */}
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/chatbot" element={<ChatBot />} />
              <Route path="/patient/diagnosis" element={<Diagnosis />} />
              <Route path="/patient/booking" element={<HospitalBooking />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
              
              {/* Doctor Flow */}
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              
              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;