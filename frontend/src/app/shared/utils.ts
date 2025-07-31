// src/app/shared/utils.ts
export function getUserFromLocalStorage() {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }
  return null;
}
