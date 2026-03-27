import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  logOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('feishu_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('feishu_user');
      }
    }
    setLoading(false);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FEISHU_AUTH_SUCCESS') {
        const feishuUser = event.data.user;
        const appUser: User = {
          uid: feishuUser.open_id || feishuUser.user_id || feishuUser.union_id,
          email: feishuUser.email || feishuUser.enterprise_email || '',
          displayName: feishuUser.name || feishuUser.en_name || '飞书用户',
          photoURL: feishuUser.avatar_url || feishuUser.avatar_thumb || undefined
        };
        setUser(appUser);
        localStorage.setItem('feishu_user', JSON.stringify(appUser));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const signIn = async () => {
    try {
      const origin = window.location.origin;
      const res = await fetch(`/api/auth/feishu/url?origin=${encodeURIComponent(origin)}`);
      const data = await res.json();
      if (data.url) {
        window.open(data.url, 'feishu_oauth', 'width=600,height=700');
      } else {
        toast.error('获取飞书登录链接失败: ' + (data.error || '未知错误'));
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('登录请求失败，请检查网络或后端配置');
    }
  };

  const logOut = async () => {
    localStorage.removeItem('feishu_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
