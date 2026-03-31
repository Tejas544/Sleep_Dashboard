import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Practitioner {
  id: string;
  email: string;
  fullName: string;
  hospitalName: string | null;
  planType: 'FREE' | 'INTERMEDIATE' | 'ADVANCE';
}

interface AuthState {
  token: string | null;
  practitioner: Practitioner | null;
  isAuthModalOpen: boolean;
  authView: 'login' | 'register';
  
  // Actions
  login: (token: string, practitioner: Practitioner) => void;
  logout: () => void;
  openAuthModal: (view?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  updatePlan: (newPlan: 'INTERMEDIATE' | 'ADVANCE') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      practitioner: null,
      isAuthModalOpen: false,
      authView: 'login',

      login: (token, practitioner) => {
        set({ token, practitioner, isAuthModalOpen: false });
      },
      
      logout: () => {
        set({ token: null, practitioner: null });
      },

      openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, authView: view }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      
      updatePlan: (newPlan) => set((state) => ({
        practitioner: state.practitioner ? { ...state.practitioner, planType: newPlan } : null
      })),
    }),
    {
      name: 'sleep-auth-storage', // The exact key we will look for in localStorage
      partialize: (state) => ({ token: state.token, practitioner: state.practitioner }), 
    }
  )
);