import React, { createContext, useContext, useEffect, useState } from 'react';

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
  analyzeSymptomsWithAI: (symptoms: string[]) => Promise<Diagnosis[]>;
  
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

  const analyzeSymptomsWithAI = async (symptomTexts: string[]): Promise<Diagnosis[]> => {
    try {
      // Replace with your backend endpoint
      const response = await fetch('http://localhost:5000/api/diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // You can add more fields as needed (age, gender, etc.)
          symptoms: symptomTexts,
        }),
      });
      if (!response.ok) throw new Error('Failed to get diagnosis from backend');
      const data = await response.json();
      // Expecting: { status: 'success', conditions: [...] }
      if (data.status === 'success' && Array.isArray(data.conditions)) {
        // Map backend response to Diagnosis[]
        return data.conditions.map((cond: any, idx: number) => ({
          id: String(idx + 1),
          condition: cond.name || cond.condition || 'Unknown',
          probability: cond.prob || 0,
          reasoning: cond.reason || '',
          urgency: cond.severity || 'low',
          doctorRecommended: cond.doctor ? true : false,
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      return [];
    }
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
    userLocation,
    setUserLocation,
    nearbyHospitals,
    setNearbyHospitals
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};