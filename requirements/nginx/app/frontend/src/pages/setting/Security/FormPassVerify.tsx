import { useEffect, useState } from "react";
import { useContext } from "react"
import { SecurityContext } from "../context/securitycontext"
import { useNavbarContext } from "../../../context/NavbarContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosAuth } from "../../../api/axiosAuth";
import { AxiosError } from "axios";

const useMyContext = () => {
	const context = useContext(SecurityContext);
	if (!context) {
	  throw new Error('useMyContext must be used within a MyContextProvider');
	}
	return context;
  };




  const FormPassVerify =()=>{
	  
	const {setisSuccess, selectedValue, setTheState, setcancelKlick, cancelKlick, setUriAA,setKeyAA} = useMyContext();
	const {isWide} = useNavbarContext();
	const [values, setValues] = useState('');
	const [isLoadingNnSe, setIsLoadingNnSe] = useState(true);
	const [isLoadingAa, setIsLoadingAa] = useState(true);
	const [isError, setIsError] = useState(false);

	// const  NoneAndSe= async ()=>{
	// 	setIsLoadingNnSe(true);
	// 	try {
	// 		const response = await fetch(`${theHost}:${port}/api/user/email-none-2fa/`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				'Authorization': `Bearer ${localStorage.getItem('access')}`,
	// 			},
	// 			body: JSON.stringify({
	// 				['2fa-option']: selectedValue,
	// 				password: values
	// 			}),
	// 		});
	
	// 		if (!response.ok) {
	// 			setIsError(true)
	// 			toast.error('Wrong Password.',{containerId:'Passverify'})
	// 			throw new Error('Wrong Password.');
	// 		}
	// 		setIsError(false)
	// 	} catch(e){
			
	// 	}
	// 	finally{
	// 		setIsLoadingNnSe(false)
	// 	}
	// }

	// const  AAhandle= async ()=>{
	// 	setIsLoadingAa(true);
	// 	try {
	// 		const response = await fetch(`${theHost}:${port}/api/user/auth-app-2fa/`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				'Authorization': `Bearer ${localStorage.getItem('access')}`,
	// 			},
	// 			body: JSON.stringify({
	// 				password: values
	// 			}),
	// 		});
	
	// 		if (!response.ok) {
	// 			setIsError(true);
	// 			toast.error('Wrong Password.',{containerId:'Passverify'})
	// 			throw new Error('Wrong Password.');
	// 		}
	// 		const result = await response.json();
	// 		setKeyAA(result.key);
	// 		setUriAA(result.uri);
	// 		setIsError(false);
	// 	} catch(e){}
	// 	finally{
	// 		setIsLoadingAa(false);
	// 	}
	// }
	
	const NoneAndSe = async () => {
		setIsLoadingNnSe(true);
		try {
			await axiosAuth.post('/user/email-none-2fa/', {
			'2fa-option': selectedValue,
			password: values
			});
			setIsError(false);
			toast.success('2FA settings updated successfully', { containerId: 'Passverify' });
		} catch (error) {
			setIsError(true);
			if (error instanceof AxiosError) {
			// console.error('Error updating 2FA settings:', error.response?.data || error.message);
			toast.error(error.response?.data?.message || 'Wrong Password', { containerId: 'Passverify' });
			} else {
			// console.error('An unexpected error occurred:', error);
			toast.error('An unexpected error occurred', { containerId: 'Passverify' });
			}
		} finally {
			setIsLoadingNnSe(false);
		}
	};
		
		const AAhandle = async () => {
		setIsLoadingAa(true);
		try {
			const response = await axiosAuth.post('/user/auth-app-2fa/', {
			password: values
			});
			const result = response.data;
			setKeyAA(result.key);
			setUriAA(result.uri);
			setIsError(false);
			toast.success('Auth app 2FA setup successful', { containerId: 'Passverify' });
		} catch (error) {
			setIsError(true);
			if (error instanceof AxiosError) {
			// console.error('Error setting up auth app 2FA:', error.response?.data || error.message);
			toast.error(error.response?.data?.message || 'Wrong Password', { containerId: 'Passverify' });
			} else {
			// console.error('An unexpected error occurred:', error);
			toast.error('An unexpected error occurred', { containerId: 'Passverify' });
			}
		} finally {
			setIsLoadingAa(false);
		}
	};

	const VerifyHandle = (e: React.FormEvent<HTMLFormElement>)=>{
		e.preventDefault();
		if(selectedValue !== "AA")
			NoneAndSe()
		else{
			AAhandle()
		}
	
	}

	useEffect(()=>{
		if(!isLoadingNnSe){
			if(!isError){
				setcancelKlick(!cancelKlick)
				setisSuccess(true);
				setTheState("main");
			}
		}
	},[isLoadingNnSe])

	useEffect(()=>{
		if(!isLoadingAa){
			if(!isError){
				// setcancelKlick(!cancelKlick)
				setTheState("App");
			}
		}
	},[isLoadingAa])


	return (
		<form className="shrink mx-5  flex flex-col w-full items-center mt-5 max-w-96 pb-5" onSubmit={VerifyHandle}
		onReset={()=>{
			setcancelKlick(!cancelKlick)
			setTheState("main");
		}}
		>
			{ isWide && <div className="flex items-center  justify-center  font-bold text-4xl text-center">Security</div>}
			<div className="flex font-bold text-xl mobile:mt-6 justify-center text-center"><span className="">Multi factor authenticator</span></div>
			<label className="text-base justify-center ml-3 mt-6 text-center">Need to verify your password, input your password and click “Verify”.</label>
			<input
				className="border dark:border-[#292929] h-12  rounded-2xl w-full p-5 dark:bg-black dark:text-white mt-5"
				type="password"
				placeholder="Password"
				autoFocus
				required
				onChange={(e)=>{
					setValues(e.currentTarget.value)
				}}
			/>
			<div className="flex  gap-2 mt-6 w-full justify-end items-center">
				<button className="dark:bg-black bg-white flex-1 h-10 rounded-xl text-black dark:text-white flex items-center justify-center hover:dark:bg-[#212121] active:dark:bg-[#797979] hover:bg-[#cecdcd] active:bg-[#9d9d9d]" type="reset">Cancel</button>
				<button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type="submit" >Verify</button>
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
					containerId='Passverify'
			/>
		</form>
	)
}

export default FormPassVerify;