import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import logo from '../assets/logo.jpg';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await loginUser(username, password);
            navigate('/');
            window.location.reload();
        } catch (err) {
            console.error("Login failed:", err);
            // Show exact error from API if available
            const apiMessage =
                err?.response?.data?.detail ||
                err?.response?.data?.error ||
                "Invalid username or password";
            setError(apiMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00E0FF] rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00E0FF] rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md glass-panel p-8 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] relative z-10 border border-[#333]">
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-[#1f1f1f] rounded-xl flex items-center justify-center mx-auto mb-6 border-2 border-[#00E0FF] shadow-[0_0_20px_rgba(0,224,255,0.3)] overflow-hidden">
                        <img src={logo} alt="NST SDC Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#E0E0E0] font-mono tracking-wider">SYSTEM LOGIN</h2>
                    <p className="text-gray-500 text-sm mt-2 font-mono">ENTER CREDENTIALS TO ACCESS PORTAL</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded mb-6 text-sm font-mono flex items-center gap-2">
                        <span className="text-lg">!</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[#00E0FF] text-xs font-bold mb-2 font-mono tracking-widest uppercase" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] text-[#E0E0E0] rounded focus:outline-none focus:border-[#00E0FF] focus:shadow-[0_0_10px_rgba(0,224,255,0.1)] transition-all font-mono"
                            placeholder="usr_access_id"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[#00E0FF] text-xs font-bold mb-2 font-mono tracking-widest uppercase" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] text-[#E0E0E0] rounded focus:outline-none focus:border-[#00E0FF] focus:shadow-[0_0_10px_rgba(0,224,255,0.1)] transition-all font-mono"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full bg-[#00E0FF]/10 text-[#00E0FF] border border-[#00E0FF]/50 font-bold py-3 px-4 rounded hover:bg-[#00E0FF] hover:text-[#050505] transition-all duration-300 font-mono tracking-widest uppercase shadow-[0_0_10px_rgba(0,224,255,0.1)] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'AUTHENTICATING...' : '> INITIATE LOGIN'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;
