import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from '@/context/toast-context';

/**
 * Hook kích hoạt thông báo Toast từ bất kỳ component nào.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return ctx;
}
