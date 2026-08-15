import { useState } from 'react';
import { User, Globe, Shield, Key, Bell, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ClientNavbar from '../../components/client/ClientNavbar';

export default function ClientSettings() {
  const [activeTab, setActiveTab] = useState('account');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '' });

  const handleSaveAccount = () => {
    toast.success('Account details updated successfully.');
  };

  const handleUpdatePassword = () => {
    if (!passwords.current || !passwords.new) {
      toast.error('Please fill in both password fields.');
      return;
    }
    toast.success('Password updated securely.');
    setPasswords({ current: '', new: '' });
  };

  const handleToggle2FA = () => {
    setIs2FAEnabled(!is2FAEnabled);
    if (!is2FAEnabled) {
      toast.success('Two-Factor Authentication enabled.');
    } else {
      toast.success('Two-Factor Authentication disabled.');
    }
  };

  const handleDeactivate = () => {
    if (window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
      toast.error('Account deactivation requested. Contacting admin.');
    }
  };

  const handlePreferenceChange = (type: string, value: string) => {
    toast.success(`${type} updated to ${value}.`);
  };

  const handleNotificationChange = (type: string, enabled: boolean) => {
    toast.success(`${type} notifications ${enabled ? 'enabled' : 'disabled'}.`);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900 font-sans flex flex-col relative">
      {/* ── Global Navbar ── */}
      <ClientNavbar active="settings" />

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col items-center justify-start pt-6 md:pt-8 pb-10 md:pb-12 px-4 md:px-8">
        <div className="w-full max-w-6xl mx-auto">
          
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your account preferences and configurations.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Sidebar */}
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:w-64 flex-shrink-0">
              <button 
                onClick={() => setActiveTab('account')}
                className={`md:w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold whitespace-nowrap flex-shrink-0 md:flex-shrink transition-all duration-300 ${activeTab === 'account' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <User className="w-5 h-5" />
                <span>Account Details</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`md:w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold whitespace-nowrap flex-shrink-0 md:flex-shrink transition-all duration-300 ${activeTab === 'preferences' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Globe className="w-5 h-5" />
                <span>Preferences</span>
              </button>

              <button 
                onClick={() => setActiveTab('notifications')}
                className={`md:w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold whitespace-nowrap flex-shrink-0 md:flex-shrink transition-all duration-300 ${activeTab === 'notifications' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>

              <button 
                onClick={() => setActiveTab('security')}
                className={`md:w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold whitespace-nowrap flex-shrink-0 md:flex-shrink transition-all duration-300 ${activeTab === 'security' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-8 min-h-[300px] transition-all duration-300">
                
                {/* Account Settings Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-6">Account Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Company Name</label>
                          <input type="text" defaultValue="Acme Logistics Corp" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Contact Person</label>
                          <input type="text" defaultValue="Jane Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Email Address</label>
                          <input type="email" defaultValue="jane.doe@acmecorp.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                          <input type="tel" defaultValue="+1 (555) 019-2831" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <button onClick={handleSaveAccount} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1">
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Preferences</h2>
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-6">
                        <div>
                          <p className="font-semibold text-slate-900">Timezone</p>
                          <p className="text-sm text-slate-500 mt-1">Select the timezone for your shipment tracking timestamps.</p>
                        </div>
                        <select 
                          onChange={(e) => handlePreferenceChange('Timezone', e.target.value)}
                          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          <option>UTC (Coordinated Universal Time)</option>
                          <option>EST (Eastern Standard Time)</option>
                          <option>IST (Indian Standard Time)</option>
                        </select>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-6">
                        <div>
                          <p className="font-semibold text-slate-900">Currency</p>
                          <p className="text-sm text-slate-500 mt-1">Default currency used for billing and invoices.</p>
                        </div>
                        <select 
                          onChange={(e) => handlePreferenceChange('Currency', e.target.value)}
                          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer"
                        >
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>INR (₹)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Notification Settings</h2>
                    <div className="space-y-6">
                      {[
                        { title: 'Shipment Updates', desc: 'Receive emails when your shipment status changes.' },
                        { title: 'New Invoice Alerts', desc: 'Get notified when a new invoice is generated.' },
                        { title: 'Marketing Communications', desc: 'Updates about new features and promotions.' },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                          <div>
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              defaultChecked={i !== 2} 
                              onChange={(e) => handleNotificationChange(item.title, e.target.checked)} 
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    <div className="flex-1 space-y-8">
                      <h2 className="text-xl font-bold text-slate-900 mb-6">Security & Authentication</h2>
                      
                      <div className="space-y-6">
                        <div className="space-y-4 border-b border-slate-100 pb-8">
                          <h3 className="font-semibold text-slate-900 flex items-center"><Key className="w-4 h-4 mr-2" /> Change Password</h3>
                          <div className="flex flex-col space-y-4 max-w-md">
                            <input 
                              type="password" 
                              placeholder="Current Password" 
                              value={passwords.current}
                              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                              className="w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" 
                            />
                            <input 
                              type="password" 
                              placeholder="New Password" 
                              value={passwords.new}
                              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                              className="w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all" 
                            />
                            <button onClick={handleUpdatePassword} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm hover:-translate-y-1 hover:shadow-md hover:shadow-orange-500/20 w-fit mt-2">
                              Update Password
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                          <div>
                            <p className="font-semibold text-slate-900">Two-Factor Authentication (2FA)</p>
                            <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                          </div>
                          <button 
                            onClick={handleToggle2FA}
                            className={`font-bold py-2.5 px-6 rounded-xl transition-all duration-300 whitespace-nowrap hover:-translate-y-1 hover:shadow-md flex items-center ${is2FAEnabled ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                          >
                            {is2FAEnabled && <CheckCircle2 className="w-4 h-4 mr-2" />}
                            {is2FAEnabled ? '2FA Enabled' : 'Enable 2FA'}
                          </button>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-100">
                          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <p className="font-bold text-red-900">Danger Zone</p>
                              <p className="text-sm text-red-700 mt-1">Permanently deactivate your account and delete all data.</p>
                            </div>
                            <button onClick={handleDeactivate} className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl font-bold transition-all hover:-translate-y-1 hover:shadow-md border border-red-200">
                              Deactivate Account
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Animated Security Image from Outside */}
                    <div className="hidden lg:flex lg:w-1/3 flex-col items-center justify-center opacity-90 border-l border-slate-100 pl-8">
                      <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f512/512.gif" alt="Animated Security Lock" width="220" height="220" className="drop-shadow-2xl opacity-80" />
                      <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">AES-256 Encrypted</p>
                    </div>

                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
