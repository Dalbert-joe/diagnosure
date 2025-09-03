import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  age?: number;
  gender?: string;
  city?: string;
  preferredLanguage?: string;
  hospitalName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app start
    const storedUser = localStorage.getItem('diagnosure_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Get stored users or create empty array
      const storedUsers = JSON.parse(localStorage.getItem('diagnosure_users') || '[]');
      
      // Find user with matching email, password, and role
      const foundUser = storedUsers.find((u: any) => 
        u.email === email && u.password === password && u.role === role
      );
      
      if (foundUser) {
        // Remove password from user object before storing
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('diagnosure_user', JSON.stringify(userWithoutPassword));
        return true;
      } else {
        // Create demo accounts if they don't exist
        if (email === 'patient@demo.com' && password === 'demo123' && role === 'patient') {
          const demoPatient: User = {
            id: 'patient-demo',
            email: 'patient@demo.com',
            name: 'Demo Patient',
            role: 'patient',
            age: 30,
            gender: 'male',
            city: 'Chennai',
            preferredLanguage: 'English'
          };
          setUser(demoPatient);
          localStorage.setItem('diagnosure_user', JSON.stringify(demoPatient));
          return true;
        } else if (email === 'doctor@demo.com' && password === 'demo123' && role === 'doctor') {
          const demoDoctor: User = {
            id: 'doctor-demo',
            email: 'doctor@demo.com',
            name: 'Dr. Demo',
            role: 'doctor',
            hospitalName: 'City General Hospital'
          };
          setUser(demoDoctor);
          localStorage.setItem('diagnosure_user', JSON.stringify(demoDoctor));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Get existing users
      const storedUsers = JSON.parse(localStorage.getItem('diagnosure_users') || '[]');
      
      // Check if user already exists
      const existingUser = storedUsers.find((u: any) => u.email === userData.email);
      if (existingUser) {
        return false; // User already exists
      }
      
      // Create new user with ID
      const newUser = {
        ...userData,
        id: `${userData.role}-${Date.now()}`
      };
      
      // Add to users array
      storedUsers.push(newUser);
      localStorage.setItem('diagnosure_users', JSON.stringify(storedUsers));
      
      // Remove password and set as current user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('diagnosure_user', JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('diagnosure_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};