import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../../components/loading/Loading';
import OOTH from "../../assets/42Logo.svg";
import LogoB from "../../assets/logoblack.png";
import axios from 'axios';
import { port, theHost, url42 } from '../../config';

function SignupPage() {
    const [inputFields, setInputFields] = useState({
        full_name: "",
        username: "",
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({
        full_name: "",
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Signup';
      }, []);

    const validateField = (name: string, value: string) => {
        switch (name) {
            case 'full_name':
                if (value.length < 4 || value.length > 50) {
                    return 'Full name must be between 4 and 50 characters.';
                }
                if (!/^[a-zA-Z0-9 ]+$/.test(value)) {
                    return 'Full name can only contain letters, numbers, and spaces.';
                }
                break;
            case 'username':
                if (value.length < 3 || value.length > 30) {
                    return 'Username must be between 3 and 30 characters.';
                }
                if (!/^[a-zA-Z0-9]+$/.test(value)) {
                    return 'Username can only contain letters and numbers.';
                }
                break;
            case 'email':
                if (!/^[a-zA-Z]+[a-zA-Z0-9_@.]+$/.test(value)) {
                    return 'Invalid email format.';
                }
                break;
            case 'password':
                if (value.length < 10) {
                    return 'Password must be at least 10 characters long.';
                }
                break;
        }
        return '';
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputFields(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleFormSubmission = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setGeneralError(null);
        setErrors({
            full_name: "",
            username: "",
            email: "",
            password: ""
        });

        // Validate all fields before submission
        const newErrors = {
            full_name: validateField('full_name', inputFields.full_name),
            username: validateField('username', inputFields.username),
            email: validateField('email', inputFields.email),
            password: validateField('password', inputFields.password),
        };

        setErrors(newErrors);

        // Check if there are any errors
        if (Object.values(newErrors).some(error => error !== '')) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${theHost}:${port}/api/user/sign-up/`,
                inputFields,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    validateStatus: (status) => status < 500,
                }
            );

            if (response.status >= 400) {
                const errorData = response.data;
                if (typeof errorData === 'object' && errorData !== null) {
                    const newErrors: {[key: string]: string} = {};
                    Object.entries(errorData).forEach(([key, value]) => {
                        if (Array.isArray(value) && value.length > 0) {
                            newErrors[key] = value[0];
                        }
                    });
                    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
                } else {
                    setGeneralError('Sign up failed. Please try again.');
                }
            } else {
                navigate('/login');
            }
        } catch (error) {
            setGeneralError('An unexpected error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    const handleAuothRedirect = () => {
        window.location.href = url42;
      };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <>
        <Link to="/">
            <img src={LogoB} alt="Transcendance Logo" className="fixed w-[60px] m-2" />
        </Link>
        <div className="flex w-full min-h-screen">
            <div className="flex content-center justify-center flex-grow bg-white">
                {loading ? (
                    <Loading />
                ) : (
                    <div className="flex flex-col min-w-[320px] sm:min-w-[420px] content-center justify-center gap-1 mx-4 mt-16">
                        <div className="text-center text-black text-xl font-mono pb-8">
                            Sign up for Transcendance
                        </div>
                        {generalError && (
                          <div className="text-red-500 text-center mt-4">{generalError}</div>
                        )}
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
                        <form onSubmit={handleFormSubmission} className="flex flex-col gap-4">
                            <div className="relative w-full">
                                <input
                                    className={`w-full p-2 pt-6 rounded-lg text-gray-700 bg-[#E9E9E9] outline-black ${errors.full_name ? 'border-red-500' : ''}`}
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={inputFields.full_name}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="absolute text-xs font-mono text-black left-3 top-2">
                                    FULL NAME
                                </label>
                                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                            </div>
                            <div className="relative w-full">
                                <input
                                    className={`w-full p-2 pt-6 rounded-lg text-gray-700 bg-[#E9E9E9] outline-black ${errors.username ? 'border-red-500' : ''}`}
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={inputFields.username}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="absolute text-xs font-mono text-black left-3 top-2">
                                    USERNAME
                                </label>
                                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                            </div>
                            <div className="relative w-full">
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
                            <div className="relative w-full">
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
                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out absolute sm:left-[145px] left-[100px]"
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
                                            SIGN UP
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </form>
                        <div className='text-center text-gray-400 text-sm pt-4'>
                            Already have an account? <button onClick={handleLogin} className="text-blue-500 hover:underline">Log in</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}

export default SignupPage;