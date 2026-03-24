import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserCircle, Trash2, Pencil, LogOut } from 'lucide-react';
import { LINES, ROLES } from '../lib/constants';
import { useAuth } from '../AuthContext';

export default function UserInfo() {
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const [userInfo, setUserInfo] = useState<{ englishName: string; chineseName: string; lineId?: string; shiftType?: string; roleId?: string; subRoleId?: string } | null>(() => {
    const stored = localStorage.getItem('user_info');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse user info", e);
      }
    }
    return null;
  });

  useEffect(() => {
    const loadUserInfo = () => {
      const storedUser = localStorage.getItem('user_info');
      if (storedUser) {
        try {
          setUserInfo(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user info", e);
        }
      } else {
        setUserInfo(null);
      }
    };
    
    loadUserInfo();
    window.addEventListener('user_info_updated', loadUserInfo);
    
    return () => {
      window.removeEventListener('user_info_updated', loadUserInfo);
    };
  }, []);

  const handleClearInfo = () => {
    window.dispatchEvent(new Event('open_user_modal'));
  };

  const handleClearAll = () => {
    localStorage.removeItem('user_info');
    localStorage.removeItem('my_shifts');
    navigate('/');
  };

  const handleLogOut = async () => {
    await logOut();
    navigate('/');
  };

  const getShiftTypeName = (type?: string) => {
    if (type === 'morning') return '早班';
    if (type === 'night') return '晚班';
    if (type === 'mixed') return '早晚混合';
    return type;
  };

  const getRoleName = () => {
    if (!userInfo?.roleId) return '';
    let name = ROLES.find(r => r.id === userInfo.roleId)?.name || userInfo.roleId;
    if (userInfo.roleId === 'writer' && userInfo.subRoleId) {
      name += ` (${userInfo.subRoleId === 'online' ? '线上' : '线下'})`;
    }
    return name;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white text-gray-800 p-4 pt-8 shadow-sm flex items-center sticky top-0 z-10">
        <button 
          onClick={() => navigate('/')}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold ml-2">用户信息</h1>
      </header>

      <main className="flex-1 p-6 flex flex-col overflow-y-auto pb-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <div className="bg-blue-50 p-4 rounded-full mb-2">
            <UserCircle className="w-16 h-16 text-blue-600" />
          </div>
          
          {userInfo ? (
            <div className="w-full space-y-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">英文名 (English Name)</p>
                <p className="text-lg font-semibold text-gray-800">{userInfo.englishName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">中文名 (Chinese Name)</p>
                <p className="text-lg font-semibold text-gray-800">{userInfo.chineseName}</p>
              </div>
              {userInfo.roleId && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">岗位</p>
                  <p className="text-lg font-semibold text-gray-800">{getRoleName()}</p>
                </div>
              )}
              {userInfo.lineId && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">所属条线</p>
                  <p className="text-lg font-semibold text-gray-800">{LINES.find(l => l.id === userInfo.lineId)?.name || userInfo.lineId}</p>
                </div>
              )}
              {userInfo.shiftType && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">偏好班次</p>
                  <p className="text-lg font-semibold text-gray-800">{getShiftTypeName(userInfo.shiftType)}</p>
                </div>
              )}
              {user && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">登录账号</p>
                  <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 mt-6">暂无用户信息</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleClearInfo}
            className="w-full py-3.5 rounded-xl font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
          >
            <Pencil className="w-5 h-5" />
            更新信息
          </button>

          <button
            onClick={handleClearAll}
            className="w-full py-3.5 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            一键清空所有数据
          </button>

          <button
            onClick={handleLogOut}
            className="w-full py-3.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>

        <div className="mt-8 text-center pb-4">
          <span className="text-[10px] text-gray-300/30 select-none cursor-default">✨ luna</span>
        </div>
      </main>
    </div>
  );
}
