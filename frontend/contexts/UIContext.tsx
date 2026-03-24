'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ToastContainer, ToastProps } from '@/components/ui/Toast';

interface ModalState {
  wallet: boolean;
  nickname: boolean;
}

interface Notification extends Omit<ToastProps, 'onClose'> {
  id: string;
}

interface UIContextType {
  modals: ModalState;
  openModal: (modal: keyof ModalState) => void;
  closeModal: (modal: keyof ModalState) => void;
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalState>({
    wallet: false,
    nickname: false,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const openModal = useCallback((modal: keyof ModalState) => {
    setModals((prev) => ({ ...prev, [modal]: true }));
  }, []);

  const closeModal = useCallback((modal: keyof ModalState) => {
    setModals((prev) => ({ ...prev, [modal]: false }));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <UIContext.Provider
      value={{
        modals,
        openModal,
        closeModal,
        showNotification,
        dismissNotification,
      }}
    >
      {children}
      <ToastContainer toasts={notifications} onClose={dismissNotification} />
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}
