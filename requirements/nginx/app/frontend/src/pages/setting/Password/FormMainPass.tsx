import { useState ,useEffect } from "react";
import { useCookies } from "react-cookie";
import { usePasswordContext } from "../context/passwordcontext";
import { useNavbarContext } from "../../../context/NavbarContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosAuth } from "../../../api/axiosAuth";
import { AxiosError } from "axios";

type ValuesType = {
	id:string;
	password: string;
	["new-password"]: string;
};

const FormMainPass = () =>{
	const {isWide, } = useNavbarContext();
	const { setTheState , setIsupdated,isSuccess,setisSuccess} = usePasswordContext()

	const [cookies] = useCookies(['userData']);
	const [oldPassword, setOldPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [isLoading, setIsLoading] = useState(true);

	const [isError, setIsError] = useState(false);

	const [isErrPassword, setIsErrPassword] = useState(false);
	const [isErrNewPassword, setIsErrNewPassword] = useState(false);
	const [isErrPasswordequal, setIsErrPasswordequal] = useState(false);
	const [isRefrech, setisRefrech] = useState(false);

	const toastUP = (type: boolean, msg: string)=>{
		if (type)
			toast.success(msg,{containerId:'MainPass'});
		else 
			toast.error(msg, {containerId:'MainPass'});
	}

	useEffect(()=>{
		if(isError){
			isErrPassword && toastUP(false,'Wrong Password.');
			isErrNewPassword && toastUP(false,'Invalid New Password.');
			isErrPasswordequal && toastUP(false,'The new password are already use.');
		}
	},[isRefrech,isError])

	useEffect(()=>{
		if(isSuccess)
			toastUP(true,'Password Updated Successfuly.') 
	},[isSuccess])

	const [data, setData] = useState({
		["new-password"]: "",
		password: "",
	  });

	  const updateData = () => {
		const newData:ValuesType = {
			id: cookies.userData.id,
			password:oldPassword,
			"new-password":newPassword
		};
		setData(newData);
	};

	useEffect(() => {
		if (!isLoading) {
		AAhandle();
	  }
	}, [data]);

	useEffect(() => {
		document.title = "Settings | Password";
	  }, []);
	
	// const  AAhandle= async ()=>{
	// 	setIsLoading(true);
	// 	try {
	// 		const response = await fetch(`${theHost}:${port}/api/user/change-password/`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				'Authorization': `Bearer ${localStorage.getItem('access')}`,
	// 			},
	// 			body: JSON.stringify(data),
	// 		});
	// 		const result = await response.json();
	// 		setIsErrNewPassword(result.message == "Not valid new password")
	// 		setIsErrPassword(result.message === "Not valid password")
	// 		setIsErrPasswordequal(result.message === "new password is the same as the old one")
	// 		if (!response.ok) {
	// 			setIsError(true);
	// 			setisRefrech(!isRefrech)
	// 			throw new Error('Password Error.');
	// 		}
	// 		toastUP(true,'Password Updated Successfuly.')
	// 		setIsError(false);
	// 		setIsupdated(true)
	// 	} catch(e){}
	// 	finally{
	// 		setIsLoading(false);
	// 	}
	// }

	const AAhandle = async () => {
		setIsLoading(true);
		try {
			const response = await axiosAuth.post('/user/change-password/', data);
			const result = response.data;
		
			setIsErrNewPassword(result.message === "Not valid new password");
			setIsErrPassword(result.message === "Not valid password");
			setIsErrPasswordequal(result.message === "new password is the same as the old one");
		
			toastUP(true, 'Password Updated Successfully.');
			setIsError(false);
			setIsupdated(true);
		} catch (error) {
			setIsError(true);
			setisRefrech(!isRefrech);
		
			if (error instanceof AxiosError) {
			const result = error.response?.data;
			if (result) {
				setIsErrNewPassword(result.message === "Not valid new password");
				setIsErrPassword(result.message === "Not valid password");
				setIsErrPasswordequal(result.message === "new password is the same as the old one");
			}
			// console.error('Error changing password:', error.response?.data || error.message);
			} else {
			// console.error('An unexpected error occurred:', error);
			}
			toastUP(false, 'Failed to update password. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

return (
	<>
	<form className="shrink mx-5  flex flex-col w-full items-center mt-5 max-w-96 pb-5"
			onSubmit={(e)=>{e.preventDefault();
				setIsLoading(false)
				updateData()
				setisSuccess(false)
			}} 
			onReset={()=>{
				setOldPassword("")
				setNewPassword("")
				setConfirmPassword("")
				setisSuccess(false)
			}}
			>
				{ isWide && <div className="flex items-center  justify-center  font-bold text-4xl text-center">Password</div>}
				<div className="flex flex-col  mobile:mt-10 mt-5  w-full">
					<label htmlFor="oldPassword" className="text-base ml-3">Old Password *</label>
					<input
						className="border dark:border-[#292929] h-12  rounded-2xl w-full p-5 dark:bg-black dark:text-white"
						onChange={(e) => {
							setOldPassword(e.target.value)
							setIsErrPassword(false)
							setisSuccess(false)
						}}
						value={oldPassword}
						id="oldPassword"
						name= "oldPassword"
						type= "password"
						placeholder= "Old Password"
						required
					/>
				</div>
				{/* new password */}
				<div className="flex flex-col  mt-3 w-full">
					<label htmlFor="newPassword" className="text-base ml-3">New Password *</label>
					<input
						className="border dark:border-[#292929] h-12  rounded-2xl w-full p-5 dark:bg-black dark:text-white"
						onChange={(e) => {
							setNewPassword(e.target.value)
							setIsupdated(false)
							setIsErrNewPassword(false)
							setIsErrPasswordequal(false)
							setisSuccess(false)
						}}
						value={newPassword}
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
						className="border dark:border-[#292929] h-12  rounded-2xl w-full p-5 dark:bg-black dark:text-white"
						onChange={(e) => {
							setConfirmPassword(e.target.value)
							setIsupdated(false)
							setisSuccess(false)
						}}
						value={confirmPassword}
						id="confirmPassword"
						name= "confirmPassword"
						type= "password"
						placeholder= "Confirm Password"
						required
						pattern={newPassword}
						title= "Passwords don't match!"
					/>
				</div>
				<div className="flex  gap-2 mt-6 w-full justify-end items-center">
						<button className="dark:bg-black bg-white flex-1 h-10 rounded-xl text-black dark:text-white flex items-center justify-center hover:dark:bg-[#212121] active:dark:bg-[#797979] hover:bg-[#cecdcd] active:bg-[#9d9d9d]" type="reset">Discard</button>
						<button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type="submit" >Update</button>
				</div>
				<div className={`mt-2 mx-5 grow-0 w-full`}>
					<button type="button" className="text-[rgb(63,63,63)] hover:text-[rgb(136,136,136)] active:text-[rgb(198,198,198)] dark:text-[rgba(255,255,255,0.6)] dark:hover:text-[rgba(255,255,255,0.5)] dark:active:text-[rgba(255,255,255,0.3)]  ml-3"
					onClick={()=>{
						setisSuccess(false)
						setTheState("forgetPassword")
					}}>* Forget Password ?</button>
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
					containerId='MainPass'
					/> 
			</form>
	</>
)
}

export default FormMainPass