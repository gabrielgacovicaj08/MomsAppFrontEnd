import { createContext } from "react";

export type AuthContextValue = {
  token: string | null;
  setToken: (newToken: string | null) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
