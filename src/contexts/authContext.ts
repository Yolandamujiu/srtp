import { createContext } from "react";

// 定义AuthContext的类型接口
interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => void;
  userRole: string | null;
  setUserRole: (role: string | null) => void;
}

// 使用类型接口创建Context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  logout: () => {},
  userRole: null,
  setUserRole: () => {},
});