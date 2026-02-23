import { signInWithGoogle } from "../services/auth.service";
import GoogleIcon from '@mui/icons-material/Google';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useState } from "react";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-3 sm:p-4">      
      {/* Main Container - Responsive */}
      <div className="relative w-full max-w-[90%] xs:max-w-sm sm:max-w-md md:max-w-lg mx-auto">
        {/* Card - Responsive padding and radius */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/50 p-6 sm:p-8 md:p-10">
          
          {/* Logo/Brand Section with Animation */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block">
              {/* Pulse ring effect */}
              <div className="absolute inset-0 rounded-2xl animate-ping bg-[#FA2E6E]/20 -z-10"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              BeatStream
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
              Music without limits
            </p>
          </div>

          {/* Welcome Message - Responsive */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 px-2">
              Sign in to continue your musical journey
            </p>
          </div>

          {/* Features Grid - Responsive */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className="text-center p-2 sm:p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-100">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FA2E6E] mb-1">∞</div>
              <p className="text-[10px] sm:text-xs text-gray-600">Unlimited</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-100">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FA2E6E] mb-1">HD</div>
              <p className="text-[10px] sm:text-xs text-gray-600">Quality</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-100">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FA2E6E] mb-1">24/7</div>
              <p className="text-[10px] sm:text-xs text-gray-600">Streaming</p>
            </div>
          </div>

          {/* Google Sign-In Button - Responsive */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#FA2E6E] hover:bg-[#E01E5A] text-white font-medium py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 group shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs sm:text-sm">Signing in...</span>
              </>
            ) : (
              <>
                <GoogleIcon fontSize="small" className="text-white text-sm sm:text-base" />
                <span className="text-xs sm:text-sm">Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider - Responsive */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 text-[10px] sm:text-xs">
                New to BeatStream?
              </span>
            </div>
          </div>

          {/* Create Account Link - Responsive */}
          <button
            onClick={handleLogin}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-200 border border-gray-200 flex items-center justify-center gap-2 group"
          >
            <span className="text-xs sm:text-sm">Create an account</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-[#FA2E6E] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Terms and Privacy - Responsive */}
          <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-6 sm:mt-8 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-gray-600 hover:text-[#FA2E6E] underline underline-offset-2 transition-colors font-medium">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-gray-600 hover:text-[#FA2E6E] underline underline-offset-2 transition-colors font-medium">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Footer Note - Responsive */}
        <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-4 sm:mt-6">
          BeatStream Beta • Version 0.1.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;