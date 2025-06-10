export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const getStoredAuth = (): AuthState => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { user, token, isAuthenticated: true };
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  return { user: null, token: null, isAuthenticated: false };
};

export const setStoredAuth = (token: string, user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }
};

export const clearStoredAuth = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
