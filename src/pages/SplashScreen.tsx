import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroMedical from '@/assets/hero-medical.jpg';
import diagnosureLogo from '@/assets/diagnosure-logo.jpg';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/role-selection');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <img 
          src={heroMedical} 
          alt="Medical Background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 animate-fade-in">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={diagnosureLogo} 
            alt="Diagnosure Logo" 
            className="w-32 h-32 mx-auto rounded-full shadow-card"
          />
        </div>
        
        {/* App Name */}
        <h1 className="text-6xl font-heading font-bold mb-4 tracking-tight">
          Diagnosure
        </h1>
        
        {/* Tagline */}
        <p className="text-xl font-body opacity-90 mb-8 max-w-md mx-auto">
          AI-Powered Medical Diagnosis & Appointment Booking
        </p>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        {/* Skip Button */}
        <button 
          onClick={() => navigate('/role-selection')}
          className="absolute bottom-8 right-8 text-white/70 hover:text-white transition-smooth underline"
        >
          Skip
        </button>
      </div>
      
      {/* Medical Icons Floating Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 text-white/10 text-4xl animate-pulse">🩺</div>
        <div className="absolute top-40 right-32 text-white/10 text-3xl animate-pulse" style={{ animationDelay: '1s' }}>💊</div>
        <div className="absolute bottom-40 left-16 text-white/10 text-5xl animate-pulse" style={{ animationDelay: '2s' }}>❤️</div>
        <div className="absolute bottom-20 right-20 text-white/10 text-4xl animate-pulse" style={{ animationDelay: '1.5s' }}>🏥</div>
      </div>
    </div>
  );
};

export default SplashScreen;