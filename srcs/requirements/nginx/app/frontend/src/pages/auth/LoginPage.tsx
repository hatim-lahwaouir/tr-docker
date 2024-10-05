import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import OOTH from "../../assets/42Logo.svg";
import Loading from '../../components/loading/Loading';
import LogoB from "../../assets/logoblack.png";
import { port, theHost, url42} from '../../config';

interface InputFields {
  email: string;
  password: string;
  verificationCode: string;
}

interface Errors {
  email: string;
  password: string;
  verificationCode: string;
}

interface LoginResult {
  details: {
    refresh: string;
    access: string;
  };
  user_data: Record<string, unknown>;
}

const LoginPage: React.FC = () => {
  const [inputFields, setInputFields] = useState<InputFields>({
    email: "",
    password: "",
    verificationCode: "",
  });

  const [errors, setErrors] = useState<Errors>({
    email: "",
    password: "",
    verificationCode: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [requireTwoFactor, setRequireTwoFactor] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [, setCookie] = useCookies(['userData']);
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    const verifyTokens = async () => {
      const refresh = localStorage.getItem('refresh');
      const access = localStorage.getItem('access');
      if (refresh && access) {
        navigate('/');
      }
    };

    verifyTokens();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');
    if (code) {
      handleOAuthLogin(code);
    }
  }, [location.search]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!/^[a-zA-Z]+[a-zA-Z0-9_@.]+$/.test(value)) {
          return 'Invalid email format.';
        }
        break;
      // case 'password':
      //   if (value.length < 10) {
      //     return 'Password must be at least 10 characters long.';
      //   }
      //   break;
      case 'verificationCode':
        if (!/^\d+$/.test(value)) {
          return 'Verification code must contain only digits.';
        }
        break;
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputFields((currentState) => ({ ...currentState, [name]: value }));
    
    const error = validateField(name, value);
    setErrors((currentErrors) => ({ ...currentErrors, [name]: error }));
  };

  const handleFormSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate all fields before submission
    const newErrors = {
      email: validateField('email', inputFields.email),
      password: validateField('password', inputFields.password),
      verificationCode: requireTwoFactor ? validateField('verificationCode', inputFields.verificationCode) : '',
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      setLoading(false);
      return;
    }

    if (requireTwoFactor) {
      handleTwoFactorAuthentication();
    } else {
      handleInitialLogin();
    }
  };

  const handleInitialLogin = async () => {
    try {
      const response = await fetch(`${theHost}:${port}/api/user/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inputFields.email,
          password: inputFields.password
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result = await response.json();
      if (result["2fa"]) {
        if (isMounted.current) setRequireTwoFactor(true);
      } else {
        handleSuccessfulLogin(result);
      }
    } catch (error) {
      if (isMounted.current) setError('Login failed. Please check your credentials and try again.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleTwoFactorAuthentication = async () => {
    try {
      const response = await fetch(`${theHost}:${port}/api/user/login-2fa/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inputFields.email,
          password: inputFields.password,
          '2fa': inputFields.verificationCode
        }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }
      const result = await response.json();
      handleSuccessfulLogin(result);
    } catch (error) {
      if (isMounted.current) setError('Verification failed. Please try again.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleSuccessfulLogin = (result: LoginResult) => {
    localStorage.setItem('refresh', result.details.refresh);
    localStorage.setItem('access', result.details.access);
    setCookie('userData', JSON.stringify(result.user_data), { 
      path: '/', 
      expires: new Date(Date.now() + 7 * 864e5) 
    });
    navigate('/');
  };

  const handleAuothRedirect = () => {
    window.location.href = url42;
  };

  const handleOAuthLogin = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${theHost}:${port}/api/user/oAuth/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('OAuth login failed');
      }

      const result = await response.json();
      handleSuccessfulLogin(result);
    } catch (error) {
      setError('OAuth login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    navigate('/resetpassword');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  useEffect(() => {
    document.title = 'Login';
  }, []);


  return (
    <>
    <Link to="/">
        <img src={LogoB} alt="Transcendance Logo" className="fixed w-[60px] m-2"/>
    </Link>
    <div className={`flex w-full min-h-screen`}>
      <div className="flex content-center justify-center flex-grow bg-white">
        {loading ? (
          <Loading />
        ) : (
          <div className="flex flex-col min-w-[320px] sm:min-w-[400px] content-center justify-center gap-6 mx-4 mt-16">
            <div className="text-center text-black text-xl font-mono">
              Log in to Transcendance
            </div>
            {error && (
              <div className="text-red-500 text-center mt-4">{error}</div>
            )}
            <form onSubmit={handleFormSubmission}>
              {!requireTwoFactor ? (
                <>
                  <div>
                    <button
                      className="bg-slate-50 border-black border-[1px] rounded-xl py-2 w-full"
                      type="button"
                      onClick={handleAuothRedirect}
                    >
                      <div className="flex flex-row justify-center gap-6">
                        <img src={OOTH} width={30} height={30} alt="" />
                        <div className="text-black text-[17px] font-semibold">42 Network</div>
                      </div>
                    </button>
                  </div>
                  <div className="text-center text-gray-500 my-4">
                    or
                  </div>
                  <div className="relative w-full mb-4">
                    <input
                      className={`w-full p-2 pt-6 rounded-lg text-gray-700 bg-[#E9E9E9] outline-black ${errors.email ? 'border-red-500' : ''}`}
                      type="email"
                      id="email"
                      name="email"
                      value={inputFields.email}
                      onChange={handleChange}
                      required
                    />
                    <label className="absolute text-xs font-mono text-black left-3 top-2">
                      EMAIL
                    </label>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div className="relative w-full mb-4">
                    <input
                      className={`w-full p-2 pt-6 rounded-lg text-gray-700 bg-[#E9E9E9] outline-black ${errors.password ? 'border-red-500' : ''}`}
                      type="password"
                      id="password"
                      name="password"
                      value={inputFields.password}
                      onChange={handleChange}
                      required
                    />
                    <label className="absolute text-xs font-mono text-black left-3 top-2">
                      PASSWORD
                    </label>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                </>
              ) : (
                <div className="relative w-full mb-4">
                  <input
                    className={`w-full p-2 pt-6 rounded-lg text-gray-700 bg-[#E9E9E9] outline-black ${errors.verificationCode ? 'border-red-500' : ''}`}
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    value={inputFields.verificationCode}
                    onChange={handleChange}
                    required
                  />
                  <label className="absolute text-xs font-mono text-black left-3 top-2">
                    VERIFICATION CODE
                  </label>
                  {errors.verificationCode && <p className="text-red-500 text-xs mt-1">{errors.verificationCode}</p>}
                </div>
              )}
              <div>
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out absolute sm:left-[140px] left-[100px]"
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
                      {requireTwoFactor ? 'VERIFY' : 'LOG IN'}
                    </div>
                  </div>
                </button>
              </div>
            </form>
            <div className='text-center text-gray-400 text-sm'>
              <button onClick={handleResetPassword} className="text-blue-500 hover:underline">Reset password</button>
            </div>
            <div className='text-center text-gray-400 text-sm'>
              No account? <button onClick={handleSignUp} className="text-blue-500 hover:underline">Create one</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default LoginPage;