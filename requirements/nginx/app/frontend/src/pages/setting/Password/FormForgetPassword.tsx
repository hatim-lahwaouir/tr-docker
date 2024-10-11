import { useState ,useEffect } from "react";
import { PasswordContext } from "../context/passwordcontext";
import { useContext } from "react"
import { useNavbarContext } from "../../../context/NavbarContext";
import { axiosAuth } from "../../../api/axiosAuth";
import { AxiosError } from "axios";

const useMyContext = () => {
	const context = useContext(PasswordContext);
	if (!context) {
		throw new Error('useMyContext must be used within a MyContextProvider');
	}
	return context;
  };

const FormForgetPassword = () =>{

	const { setTheState, email, setEmail} = useMyContext()
	const {isWide} = useNavbarContext();
	const [isLoadingEmail, setIsLoadingEmail] = useState(true);

	useEffect(() => {
		document.title = "Settings | Forget Password";
	}, []);

	const emailfetch = async () => {
		setIsLoadingEmail(true);
		try {
			await axiosAuth.post('/user/forget-password/', { email });
			setTheState("changePass");
		} catch (error) {
			if (error instanceof AxiosError) {
			// console.error('Error sending password reset email:', error.response?.data || error.message);
			} else {
			// console.error('An unexpected error occurred:', error);
			}
		} finally {
			setIsLoadingEmail(false);
		}
		};
		
		const fetchingUserEmail = async () => {
		setIsLoadingEmail(true);
		try {
			const response = await axiosAuth.get('/user/me/');
			setEmail(response.data.user_data.email);
		} catch (error) {
			if (error instanceof AxiosError) {
			// console.error('Error fetching user email:', error.response?.data || error.message);
			} else {
			// console.error('An unexpected error occurred:', error);
			}
		} finally {
			setIsLoadingEmail(false);
		}
	};


	const VerifyHandle = (e: React.FormEvent<HTMLFormElement>)=>{
		e.preventDefault();
		emailfetch()
	}

	useEffect(()=>{
		fetchingUserEmail()
	},[])


	return <>
		{
			!isLoadingEmail &&
			<form className="shrink mx-5  flex flex-col w-full items-center mt-5 max-w-96 pb-5"
			onSubmit={VerifyHandle} 
			onReset={()=>{
				setTheState("main")
			}}
			>
				{ isWide && <div className="flex items-center  justify-center  font-bold text-4xl text-center">Password</div>}
				<div className="flex font-bold text-xl mt-6 justify-center text-center"><span className="">Forget Password.</span></div>
				<label className="text-base justify-center ml-3 mt-6 text-center">We'll send you a 7-digit code to your email:</label>
				<label className="text-base justify-center ml-3 text-center">{email}</label>
				<div className="flex  gap-2 mt-6 w-full justify-end items-center">
						<button className="dark:bg-black bg-white flex-1 h-10 rounded-xl text-black dark:text-white flex items-center justify-center hover:dark:bg-[#212121] active:dark:bg-[#797979] hover:bg-[#cecdcd] active:bg-[#9d9d9d]" type="reset">Cancel</button>
						<button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type="submit" >Send Code</button>
				</div>
			</form>
		}
		
	</>
}

export default FormForgetPassword