import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import WithdrawalPopup from "@/components/WithdrawalPopup";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPanel from "@/components/AdminPanel";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { supabase } from "./supabaseClient";
import SplashScreen from "@/components/SplashScreen";
import SignupModal from "@/components/SignupModal";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
    const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 3000); // Match splash animation
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setUser(data.user);
          setUsername(data.user.user_metadata?.username || data.user.email);
        } else {
          setShowSignup(true);
        }
      });
    }
  }, [showSplash]);

    const handleSignupSuccess = (user: User, username: string) => {
    setUser(user);
    setUsername(username);
    setShowSignup(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <WithdrawalPopup />
        {showSplash && <SplashScreen />}
        {!showSplash && showSignup && (
          <SignupModal onSignupSuccess={handleSignupSuccess} />
        )}
        {!showSplash && user && (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index username={username} />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>

          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
