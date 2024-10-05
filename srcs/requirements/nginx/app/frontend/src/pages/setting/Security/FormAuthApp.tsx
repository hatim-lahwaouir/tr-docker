import OtpInput from '../SettingsTools/OtpInput';
import { useState } from 'react';
import QRCode from "react-qr-code";
import { useContext, useEffect } from "react"
import { SecurityContext } from "../context/securitycontext"
import { useNavbarContext } from "../../../context/NavbarContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosAuth } from '../../../api/axiosAuth';
import { AxiosError } from 'axios';


  const useMyContext = () => {
	const context = useContext(SecurityContext);
	if (!context) {
	  throw new Error('useMyContext must be used within a MyContextProvider');
	}
	return context;
  };

const FormAuthApp = () =>{
	const { setisSuccess, setTheState , uriAA, keyAA, setcancelKlick,cancelKlick} = useMyContext()
	const {isWide} = useNavbarContext();
	const [otp, setOtp] = useState<string>('');
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);

	const handleOtpChange = (value: string) => {
		setOtp(value);
		
	  };
	function splitS(input: string): string {
		// Split the string into an array of substrings with each having a maximum length of 4
		const chunks: string[] = [];
		for (let i = 0; i < input.length; i += 4) {
			chunks.push(input.substring(i, i + 4));
		}
		// Join the chunks with a space and return the result
		return chunks.join(' ');
	}

	// const  handlefetch= async ()=>{
	// 	setIsLoading(true);
	// 	try {
	// 		const response = await fetch(`${theHost}:${port}/api/user/auth-app-verify/`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				'Authorization': `Bearer ${localStorage.getItem('access')}`,
	// 			},
	// 			body: JSON.stringify({
	// 				code: otp
	// 			}),
	// 		});
	
	// 		if (!response.ok) {
	// 			setIsError(true)
	// 			toast.error('Wrong Code',{containerId:'AuthApp'})
	// 			throw new Error('Wrong Password.');
	// 		}
	// 		setIsError(false)
	// 	} catch(e){
			
	// 	}
	// 	finally{
	// 		setIsLoading(false)
	// 	}
	// }

	const handlefetch = async () => {
		setIsLoading(true);
		try {
			await axiosAuth.post('/user/auth-app-verify/', { code: otp });
			setIsError(false);
			toast.success('OTP verified successfully', { containerId: 'AuthApp' });
		} catch (error) {
			setIsError(true);
			if (error instanceof AxiosError) {
			// console.error('Error verifying OTP:', error.response?.data || error.message);
			toast.error(error.response?.data?.message || 'Wrong Code', { containerId: 'AuthApp' });
			} else {
			// console.error('An unexpected error occurred:', error);
			toast.error('An unexpected error occurred', { containerId: 'AuthApp' });
			}
		} finally {
			setIsLoading(false);
		}
	};

	const VerifyHandle = (e: React.FormEvent<HTMLFormElement>)=>{
		e.preventDefault();
		handlefetch();
	}

	useEffect(()=>{
		if(!isLoading){
			if(!isError){
				setcancelKlick(!cancelKlick)
				setisSuccess(true)
				setTheState("main");
			}
		}
	},[isLoading])
	
return (
	<form className="shrink mx-5  flex flex-col w-full items-center mobile:mt-5 max-w-96 pb-5" onSubmit={VerifyHandle} onReset={()=>{
		setcancelKlick(!cancelKlick);
		setTheState("main");}}>
		{ isWide && <div className="flex items-center  justify-center  font-bold text-4xl text-center">Security</div>}
		<div className="flex font-bold text-xl mobile:mt-6 justify-center text-center">Setup authenticator app</div>
		<div className="text-base justify-center mt-6 text-center">Use a phone app like 1Password, Authy, LastPass Authenticator, or Microsoft Authenticator, etc. to get 2FA codes when prompted during sign-in.</div>
		<div className="flex justify-center  items-center mt-6 text-center">
			<div className='flex shrink border-4 border-white'><QRCode value={uriAA} size={140}/></div>
		</div>
		<div className="text-base justify-center mt-6 text-center">Use an authentication app from your phone to scan. If you are unable to scan, enter this text code instead</div>
		<div className="text-xl justify-center mt-6 text-center">{splitS(keyAA)}</div>
		
		<div className="text-base justify-center mt-6 text-center">Verify the code from the app.</div>
		<OtpInput length={6} onChange={handleOtpChange}/>
		<div className="flex  gap-2 mt-6 w-full justify-end items-center">
			<button className="dark:bg-black bg-white flex-1 h-10 rounded-xl text-black dark:text-white flex items-center justify-center hover:dark:bg-[#212121] active:dark:bg-[#797979] hover:bg-[#cecdcd] active:bg-[#9d9d9d]" type="reset">Cancel</button>
			<button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type="submit" >Continue</button>
		</div>
		<ToastContainer
			position= {"top-right"}
			autoClose={5000}
			hideProgressBar
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme="colored"
			containerId='AuthApp'
		/>
	</form>
)

}

export default FormAuthApp;