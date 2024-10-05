import { useState ,useEffect } from "react";
import { PasswordContext } from "../context/passwordcontext";
import { useContext } from "react"
import { useNavbarContext } from "../../../context/NavbarContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosAuth } from "../../../api/axiosAuth";
import { AxiosError } from "axios";

const useMyContext = () => {
	const context = useContext(PasswordContext);
	if (!context) {
	  throw new Error('useMyContext must be used within a MyContextProvider');
	}
	return context;
  };

const FormChangePass = () =>{
	const {isWide} = useNavbarContext();
	const { setTheState, email, setIsupdated, setIsLoading, setisSuccess } = useMyContext()

	const [confirmPassword, setConfirmPassword] = useState("")

	const [isError, setIsError] = useState(false);
	const [isErrNewPassword, setIsErrNewPassword] = useState(false);
	const [isErrPasswordequal, setIsErrPasswordequal] = useState(false);

	const [isLoadingCode, setIsLoadingCode] = useState(true);
	const [isErrCode, setIsErrCode] = useState(false);
	const [newPasswordCode, setNewPasswordCode] = useState("")
	const [datacode, setdatacode] = useState({});
	
	const [code6, setcode6] = useState("")
	const [isRefrech, setisRefrech] = useState(false)

	const toastUP = (type:boolean, msg:string)=>{
		if (type)
			toast.success(msg,{containerId:'ChangePass'});
		else 
			toast.error(msg, {containerId:'ChangePass'});
	}

	useEffect(()=>{
		if(isError){
			isErrCode && toastUP(false,'Wrong 7-digit Code.');
			isErrNewPassword && toastUP(false,'Invalid New Password.');
			isErrPasswordequal && toastUP(false,'The new password are already use.');
		}
	},[isRefrech,isError])

	type ValuescodeType = {
		email:string;
		["new-password"]: string;
		code: string;
	};

	const updateDataCode = () => {
		const newData:ValuescodeType = {
			email: email,
			["new-password"]:newPasswordCode,
			code:code6
		};
		setdatacode(newData); 
	};

	useEffect(() => {
		if (!isLoadingCode) {
		codehandle();
	}
	}, [datacode]);

	const codehandle = async () => {
		setIsLoadingCode(true);
		try {
			const response = await axiosAuth.post('/user/new-password/', datacode);
			const result = response.data;
		
			setIsErrNewPassword(result.message === "Not valid new password");
			setIsErrCode(result.message === "Invalid code");
			setIsErrPasswordequal(result.message === "new password is the same as the old one");
		
			setIsError(false);
			setIsupdated(true);
			setIsLoading(false);
			setTheState("main");
			setisSuccess(true);
		} catch (error) {
			setIsError(true);
			setisRefrech(!isRefrech);
		
			if (error instanceof AxiosError) {
			const result = error.response?.data;
			if (result) {
				setIsErrNewPassword(result.message === "Not valid new password");
				setIsErrCode(result.message === "Invalid code");
				setIsErrPasswordequal(result.message === "new password is the same as the old one");
			}
			// console.error('Error handling code:', error.response?.data || error.message);
			} else {
			// console.error('An unexpected error occurred:', error);
			}
		} finally {
			setIsLoadingCode(false);
		}
	};

	return <>
		<form className="shrink mx-5  flex flex-col w-full items-center mt-5 max-w-96 pb-5"
			onSubmit={(e)=>{e.preventDefault();
				setIsLoadingCode(false)
				updateDataCode()}} 
			onReset={()=>{
				setTheState("main")
			}}>
			{ isWide && <div className="flex items-center  justify-center  font-bold text-4xl text-center">Password</div>}
			<div className="flex font-bold text-xl mobile:mt-6 justify-center text-center"><span className="">Forget Password.</span></div>
				{/* code 6*/}
			<div className="flex flex-col  mt-3 w-full">
				<label htmlFor="code6" className="text-base ml-3">Write the 7-digit code that we have send you on email here. *</label>
				<input
					className={`border dark:border-[#292929] h-12  rounded-2xl w-full p-5 dark:bg-black dark:text-white`}
					onChange={(e) => {
						setcode6(e.target.value)
						setIsErrCode(false)
					}}
					value={code6}
					id="code6"
					name= "code6"
					type= "number"
					placeholder= "7-digit Code"
					required
				/>
			</div>
			{/* new password */}
			<div className="flex flex-col  mt-3 w-full">
				<label htmlFor="newPassword" className="text-base ml-3">New Password *</label>
				<input
					className={`border dark:border-[#292929] h-12  rounded-2xl w-full p-5 dark:bg-black dark:text-white`}
					onChange={(e) => {
						setNewPasswordCode(e.target.value)
						setIsupdated(false)
						setIsErrNewPassword(false)
						setIsErrPasswordequal(false)
					}}
					value={newPasswordCode}
					id="newPassword"
					name= "newPassword"
					type= "password"
					placeholder= "New Password"
					required
				/>
			</div>
			{/* comfirm password */}
			<div className="flex flex-col  mt-3 w-full">
				<label htmlFor="confirmPassword" className="text-base ml-3">Confirm Password *</label>
				<input
					className={`border dark:border-[#292929] h-12  rounded-2xl w-full p-5 dark:bg-black dark:text-white`}
					onChange={(e) => {
						setConfirmPassword(e.target.value)
						setIsupdated(false)
					}}
					value={confirmPassword}
					id="confirmPassword"
					name= "confirmPassword"
					type= "password"
					placeholder= "Confirm Password"
					required
					pattern={newPasswordCode}
					title= "Passwords don't match!"
				/>
			</div>
			<div className="flex  gap-2 mt-6 w-full justify-end items-center">
					<button className="dark:bg-black bg-white flex-1 h-10 rounded-xl text-black dark:text-white flex items-center justify-center hover:dark:bg-[#212121] active:dark:bg-[#797979] hover:bg-[#cecdcd] active:bg-[#9d9d9d]" type="reset">Cancel</button>
					<button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type="submit" >Update</button>
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
					containerId='ChangePass'
			/>
		</form>
	</>
}

export default FormChangePass