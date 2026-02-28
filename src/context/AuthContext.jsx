import { createContext, useContext, useState, useEffect } from 'react';
import insforge from '../api/insforge';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await insforge.auth.getCurrentSession();
      if (data?.session) {
        const { user } = data.session;

        // Fetch role from profile table
        const { data: profile } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const role = profile?.role || user.user_metadata?.role || 'patient';
        const userData = {
          id: user.id,
          email: user.email,
          name: profile?.name || user.user_metadata?.name || user.email.split('@')[0],
          role: role,
        };
        setUser(userData);
        localStorage.setItem('clinic_user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setError(null);
    try {
      const { data, error } = await insforge.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { user } = data;

      // Fetch role from profile table
      const { data: profile } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      let role = profile?.role || user.user_metadata?.role || 'patient';

      // ADMIN LOCK: Force Admin role for the specific credential
      if (email === 'admin123@gmail.com') {
        role = 'admin';
      }

      const userData = {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || user.email.split('@')[0],
        role: role,
      };
      setUser(userData);
      localStorage.setItem('clinic_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const signUp = async (email, password, name, role = 'patient') => {
    setError(null);
    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name,
      });
      if (error) throw error;

      if (data?.user && !data.requireEmailVerification) {
        // Automatically set the role in the profile only if verified
        await insforge.auth.setProfile({ role, name });

        // Also sync with the profiles table in public schema
        await insforge.database.from('profiles').insert([{
          id: data.user.id,
          name,
          email,
          role
        }]);

        // Sync with role-specific tables
        if (role === 'patient') {
          await insforge.database.from('patients').insert([{
            profile_id: data.user.id,
            name,
            email,
            visits: 0
          }]);
        } else if (role === 'doctor') {
          await insforge.database.from('doctors').insert([{
            profile_id: data.user.id,
            name,
            email,
            specialization: 'General Physician'
          }]);
        }
      }

      return { success: true, requireVerification: data?.requireEmailVerification };
    } catch (err) {
      const message = err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const verifyOTP = async (email, otp, name, role) => {
    setError(null);
    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp,
      });
      if (error) throw error;

      if (data?.user) {
        // Now that we have a session, set the profile
        await insforge.auth.setProfile({ role, name });

        // Sync with profiles table
        await insforge.database.from('profiles').insert([{
          id: data.user.id,
          name: name || data.user.profile?.name || email.split('@')[0],
          email,
          role: role || 'patient'
        }]);

        // Sync with role-specific tables
        const role_val = role || 'patient';
        if (role_val === 'patient') {
          await insforge.database.from('patients').insert([{
            profile_id: data.user.id,
            name: name || email.split('@')[0],
            email,
            visits: 0
          }]);
        } else if (role_val === 'doctor') {
          await insforge.database.from('doctors').insert([{
            profile_id: data.user.id,
            name: name || email.split('@')[0],
            email,
            specialization: 'General Physician'
          }]);
        }

        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: name || data.user.profile?.name || email.split('@')[0],
          role: role || 'patient',
        };
        setUser(userData);
        localStorage.setItem('clinic_user', JSON.stringify(userData));
      }

      return { success: true };
    } catch (err) {
      const message = err.message || 'Verification failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    try {
      await insforge.auth.signOut();
      setUser(null);
      localStorage.removeItem('clinic_user');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateRole = async (newRole) => {
    try {
      await insforge.auth.setProfile({ role: newRole });
      await insforge.database.from('profiles').update({ role: newRole }).eq('id', user.id);
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('clinic_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Update role error:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    verifyOTP,
    signOut,
    updateRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
