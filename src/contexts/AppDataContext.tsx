import React, { createContext, useContext, useState, useEffect } from 'react';

interface Symptom {
  id: string;
  text: string;
  timestamp: Date;
}

interface Diagnosis {
  id: string;
  condition: string;
  probability: number;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  doctorRecommended: boolean;
}

interface Booking {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  hospitalName: string;
  hospitalAddress: string;
  slot: string;
  date: string;
  note: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  diagnosis?: string;
  createdAt: Date;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'doctor';
  timestamp: Date;
  type?: 'text' | 'image';
  imageUrl?: string;
}

interface AppDataContextType {
  // Symptoms & Chat
  symptoms: Symptom[];
  addSymptom: (text: string) => void;
  clearSymptoms: () => void;
  
  // Chat Messages
  chatMessages: ChatMessage[];
  addChatMessage: (text: string, sender: 'user' | 'ai' | 'doctor', type?: 'text' | 'image', imageUrl?: string) => void;
  clearChat: () => void;
  
  // Diagnosis
  diagnoses: Diagnosis[];
  setDiagnoses: (diagnoses: Diagnosis[]) => void;
  
  // Bookings
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  getDoctorBookings: () => Booking[];
  
  // AI Integration
  analyzeSymptomsWithAI: (symptoms: string[], additionalContext?: {
    medications?: string;
    duration?: string;
    existingConditions?: string;
    followUpResponses?: string[];
  }) => Promise<Diagnosis[]>;
  
  // Symptom Context
  symptomContext: {
    medications?: string;
    duration?: string;
    existingConditions?: string;
    followUpResponses?: string[];
  };
  updateSymptomContext: (context: Partial<{
    medications?: string;
    duration?: string;
    existingConditions?: string;
    followUpResponses?: string[];
  }>) => void;
  
  // Location & Hospitals
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number }) => void;
  nearbyHospitals: any[];
  setNearbyHospitals: (hospitals: any[]) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedBookings = localStorage.getItem('diagnosure_bookings');
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('diagnosure_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const addSymptom = (text: string) => {
    const newSymptom: Symptom = {
      id: Date.now().toString(),
      text,
      timestamp: new Date()
    };
    setSymptoms(prev => [...prev, newSymptom]);
  };

  const clearSymptoms = () => {
    setSymptoms([]);
  };

  const addChatMessage = (text: string, sender: 'user' | 'ai' | 'doctor', type: 'text' | 'image' = 'text', imageUrl?: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      type,
      imageUrl
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setBookings(prev => [...prev, newBooking]);
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status } : booking
    ));
  };

  const getDoctorBookings = (): Booking[] => {
    // Return all bookings for doctor dashboard (in real app, filter by hospital/doctor)
    return bookings.sort((a, b) => {
      // Sort by urgency first, then by creation date
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency] || 
             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  // Store additional symptom context
  const [symptomContext, setSymptomContext] = useState<{
    medications?: string;
    duration?: string;
    existingConditions?: string;
    followUpResponses?: string[];
  }>({});

  const analyzeSymptomsWithAI = async (
    symptomTexts: string[], 
    additionalContext?: {
      medications?: string;
      duration?: string;
      existingConditions?: string;
      followUpResponses?: string[];
    }
  ): Promise<Diagnosis[]> => {
    try {
      // Check if Gemini API key is available
      const apiKey = localStorage.getItem('gemini_api_key');
      
      if (!apiKey) {
        // Show API key input modal
        const userApiKey = prompt(
          'Please enter your Gemini API key to enable AI diagnosis:\n\n' +
          'Get your free API key from: https://makersuite.google.com/app/apikey\n\n' +
          'Note: In production, this would be handled securely by the backend.'
        );
        
        if (!userApiKey) {
          throw new Error('Gemini API key is required for AI diagnosis');
        }
        
        localStorage.setItem('gemini_api_key', userApiKey);
      }

      const { geminiService } = await import('@/services/geminiService');
      
      const request = {
        symptoms: symptomTexts,
        medications: additionalContext?.medications || symptomContext.medications,
        duration: additionalContext?.duration || symptomContext.duration,
        existingConditions: additionalContext?.existingConditions || symptomContext.existingConditions,
        followUpResponses: additionalContext?.followUpResponses || symptomContext.followUpResponses || []
      };

      const diagnoses = await geminiService.analyzeSymptomsWithAI(request);
      return diagnoses;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw error;
    }
  };

  const updateSymptomContext = (context: Partial<{
    medications?: string;
    duration?: string;
    existingConditions?: string;
    followUpResponses?: string[];
  }>) => {
    setSymptomContext(prev => ({ ...prev, ...context }));
  };

  const value = {
    symptoms,
    addSymptom,
    clearSymptoms,
    chatMessages,
    addChatMessage,
    clearChat,
    diagnoses,
    setDiagnoses,
    bookings,
    addBooking,
    updateBookingStatus,
    getDoctorBookings,
    analyzeSymptomsWithAI,
    symptomContext,
    updateSymptomContext,
    userLocation,
    setUserLocation,
    nearbyHospitals,
    setNearbyHospitals
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};