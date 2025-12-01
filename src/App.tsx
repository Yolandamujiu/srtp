import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import MotionImageryTraining from "@/pages/MotionImageryTraining";
import ResearcherDashboard from "@/pages/ResearcherDashboard";
import SubjectTraining from "@/pages/SubjectTraining";
import RoleSelection from "@/pages/RoleSelection";
import { useState } from "react";
import { AuthContext } from '@/contexts/authContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null); // 'researcher' or 'subject'

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        setIsAuthenticated, 
        logout,
        userRole,
        setUserRole
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/motion-imagery-training" element={<MotionImageryTraining />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/researcher-dashboard" element={<ResearcherDashboard />} />
        <Route path="/subject-training" element={<SubjectTraining />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </AuthContext.Provider>
  );
}
