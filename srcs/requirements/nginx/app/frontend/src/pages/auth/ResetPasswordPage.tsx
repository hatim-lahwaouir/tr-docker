import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loading from '../../components/loading/Loading';
import { port, theHost } from '../../config';

interface ApiResponse {
  success: boolean;
  message: string;
}

function ResetPasswordPage(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const { token } = useParams<{ token?: string }>();

  useEffect(() => {
    document.title = 'Reset Password';
  }, []);

  const validatePassword = (value: string): string => {
    if (value.length < 10) {
      return 'Password must be at least 10 characters long.';
    }
    return '';
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${theHost}:${port}/api/user/reset-password/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link. Please try again.');
      }

      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPasswordError('');

    if (!token) {
      setError('No reset token provided. Please use the link from your email.');
      setLoading(false);
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${theHost}:${port}/api/user/my-new-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password,
          'url': token,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password. Please try again.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const renderContent = () => {
    if (success) {
      return (
        <div className="text-green-500 text-center">
          Your password has been successfully reset. You can now <a href="/login" className="text-blue-500 hover:underline">log in</a> with your new password.
        </div>
      );
    }

    if (token) {
      return (
        <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
          <div className="relative w-full">
            <input
              className={`w-full p-2 pt-6 rounded-lg text-gray-700 bg-[#E9E9E9] outline-black ${passwordError ? 'border-red-500' : ''}`}
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <label className="absolute text-xs font-mono text-black left-3 top-2">
              NEW PASSWORD
            </label>
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>
          <button
            className="bg-black border-[1px] rounded-xl hover:rounded-none py-3 w-full group transition-all duration-300 ease-in-out relative overflow-hidden"
            type="submit"
          >
            <div className="flex flex-row justify-center items-center gap-6 transition-transform duration-300 ease-in-out transform group-hover:translate-x-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out absolute sm:left-[100px] left-[60px]"
                stroke="white"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <div className="text-white text-[17px] font-semibold">
                RESET PASSWORD
              </div>
            </div>
          </button>
        </form>
      );
    }

    if (emailSent) {
      return (
        <div className="text-center text-black">
          <p>A password reset link has been sent to your email.</p>
          <p>Please check your inbox and click on the link to reset your password.</p>
        </div>
      );
    }

    return (
      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
        <div className="relative w-full">
          <input
            className="w-full p-2 pt-6 rounded-lg text-gray-700 bg-[#E9E9E9] outline-black"
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          <label className="absolute text-xs font-mono text-black left-3 top-2">
            EMAIL
          </label>
        </div>
        <button
          className="bg-black border-[1px] rounded-xl hover:rounded-none py-3 w-full group transition-all duration-300 ease-in-out relative overflow-hidden"
          type="submit"
        >
          <div className="flex flex-row justify-center items-center gap-6 transition-transform duration-300 ease-in-out transform group-hover:translate-x-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out absolute sm:left-[100px] left-[60px]"
              stroke="white"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <div className="text-white text-[17px] font-semibold">
              SEND RESET LINK
            </div>
          </div>
        </button>
      </form>
    );
  };

  return (
    <div className="flex w-full min-h-screen">
      <div className="flex content-center justify-center flex-grow bg-white">
        {loading ? (
          <Loading />
        ) : (
          <div className="flex flex-col min-w-[320px] sm:min-w-[400px] content-center justify-center gap-6">
            <div className="text-center text-black text-xl font-mono">
              Reset Password
            </div>
            {renderContent()}
            {error && (
              <div className="text-red-500 text-center mt-4">{error}</div>
            )}
            <div className='text-center text-black'>
              Remember your password? <a href="/login" className="text-blue-500 hover:underline">Log in</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;