
// import { useState } from "react";
import { useContext, useEffect } from "react"
import { SecurityContext } from "../context/securitycontext"
import { useNavbarContext } from "../../../context/NavbarContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


  const useMyContext = () => {
	const context = useContext(SecurityContext);
	if (!context) {
	  throw new Error('useMyContext must be used within a MyContextProvider');
	}
	return context;
  };

const FormMain = () => {
	const { isSuccess, setisSuccess, defaultValue, selectedValue, setSelectedValue, setTheState } = useMyContext()
	const {isWide} = useNavbarContext();

	const handleChange = (id: string) => {
		setisSuccess(false);
		setSelectedValue(id);
	};

	useEffect(()=>{
		if(isSuccess)
			toast.success('2FA Updated Successfuly.', {containerId:'FormMain'}) 
	},[isSuccess])
	return(
		<>
			<form className="shrink mx-5  flex flex-col w-full items-center mt-5 max-w-96 pb-5"
				onSubmit={(e)=>{e.preventDefault();
					if (selectedValue !== defaultValue)
						setTheState("PassVerify");
				}}
				onReset={()=>{
					setSelectedValue(defaultValue);
				}}>
				{ isWide && <div className="flex items-center  justify-center  font-bold text-4xl text-center">Security</div>}
				<div className="flex font-bold text-xl mobile:mt-6 text-center">Set up two - Factor Authentication (2FA)</div>
				<div className="flex p-2 rounded mt-5 w-full" >
					<div className="flex items-center h-5">
						<input name="Security" id={"NONE"}  type="radio" value="" className="w-6 h-6 text-gray-600  bg-gray-600 border-gray-500 accent-black"
						checked={"NONE" === selectedValue}
						onChange={() => handleChange("NONE")} />
					</div>
					<div className="ms-2 text-sm">
						<label htmlFor={"NONE"} className="font-medium text-black dark:text-white">
							<div>Disable.</div>
							{/* <p className="text-xs font-normal text-gray-400">{radio.description}</p> */}
						</label>
					</div>
				</div>
				<div className="flex p-2 rounded mt-5 w-full" >
					<div className="flex items-center h-5">
						<input name="Security" id={"SE"}  type="radio" value="" className="w-6 h-6 text-gray-600  bg-gray-600 border-gray-500 accent-black"
						checked={"SE" === selectedValue}
						onChange={() => handleChange("SE")} />
					</div>
					<div className="ms-2 text-sm">
						<label htmlFor={"SE"} className="font-medium text-black dark:text-white">
							<div >Email.</div>
							<p className="text-xs font-normal text-[#848484]">Use your email to receive a email with an authentication code to enter when you log in to account.</p>
						</label>
					</div>
				</div>
				<div className="flex p-2 rounded mt-5 w-full" >
					<div className="flex items-center h-5">
						<input name="Security" id={"AA"}  type="radio" value="" className="w-6 h-6 text-gray-600  bg-gray-600 border-gray-500 accent-black"
						checked={"AA" === selectedValue}
						onChange={() => handleChange("AA")} />
					</div>
					<div className="ms-2 text-sm">
						<label htmlFor={"AA"} className="font-medium text-black dark:text-white">
							<div>Authentication app.</div>
							<p className="text-xs font-normal text-[#848484]">Use a mobile authentication app to get a verification code to enter every time you log in to account.</p>
						</label>
					</div>
				</div>
				<div className="flex  gap-2 mt-6 w-full justify-end items-center">
						<button className="dark:bg-black bg-white flex-1 h-10 rounded-xl text-black dark:text-white flex items-center justify-center hover:dark:bg-[#212121] active:dark:bg-[#797979] hover:bg-[#cecdcd] active:bg-[#9d9d9d]" type="reset">Discard</button>
						<button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type="submit" disabled={selectedValue === defaultValue} >Update</button>
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
					containerId='FormMain'
			/>
			</form> 
		</>
	)
}

export default FormMain;