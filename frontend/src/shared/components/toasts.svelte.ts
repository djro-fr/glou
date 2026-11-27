export interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

export const LOAD_ERROR_MESSAGE = 'Impossible de charger les données pour le moment.';

export const toastState = $state({
  list: [] as Toast[]
});
 
let nextId = 0;

export function addToast(message : Toast['message'], type : Toast['type']) {
  if (toastState.list.some((t) => t.message === message)) return;
  toastState.list.push({ id : nextId++ , message, type })  
}

export function removeToast(id: Toast['id']) {
  toastState.list = toastState.list.filter((t) => t.id !== id);
}