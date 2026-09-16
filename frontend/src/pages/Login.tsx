import { Mail } from 'lucide-react';

interface Props {
  onLogin: () => void;
  error?: string | null;
}

const Login = ({ onLogin, error }: Props) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 mb-4">
          <Mail className="w-12 h-12" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          NebulaMail AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          AI-powered email workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              onClick={onLogin}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Continue with Google
            </button>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            Phase 3: Real Gmail Integration
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
