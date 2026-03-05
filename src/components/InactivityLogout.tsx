import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes
const CHECK_INTERVAL = 60 * 1000; // Check every minute

export default function InactivityLogout() {
  const navigate = useNavigate();
  const location = useLocation();

  const updateLastActivity = () => {
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  const checkInactivity = async () => {
    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
    const now = Date.now();
    
    if (now - lastActivity >= INACTIVITY_TIMEOUT) {
      if (location.pathname === '/auth') return;
      
      try {
        await supabase.auth.signOut();
        navigate('/auth');
      } catch (error) {
        console.error('Error signing out due to inactivity:', error);
      }
    }
  };

  useEffect(() => {
    // Only track activity if not on auth page
    if (location.pathname === '/auth') return;

    // Set initial activity if not set
    if (!localStorage.getItem('lastActivity')) {
      updateLastActivity();
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      updateLastActivity();
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check inactivity periodically
    const interval = setInterval(checkInactivity, CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [location.pathname, navigate]);

  return null;
}
