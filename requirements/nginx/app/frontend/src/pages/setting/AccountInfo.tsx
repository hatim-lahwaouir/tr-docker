import { useNavbarContext } from "../../context/NavbarContext";
import { useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { getCroppedImageFile } from "./ImageTools";
import imageCompression from 'browser-image-compression';

import { useCookies } from "react-cookie";
import Cropper from "react-easy-crop";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosAuth } from "../../api/axiosAuth";
import { AxiosError } from "axios";
import { port, theHost } from "../../config";

type ValuesType = {
	id:number,
	username?: string,
	full_name?: string,
};

function AccountInfo() {
	const picupload = useRef<HTMLInputElement>(null);
	const {isWide} = useNavbarContext();
	const [cookies, setCookie] = useCookies(['userData']);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadings, setIsLoadings] = useState(false);
	const [errUser, seterrUser] = useState(false);
	const [errUserinvalid, seterrUserincalid] = useState(false);
	const [errName, seterrName] = useState(false);
	
	const [userupdate, setuserupdate] = useState(false);
	const [nameupdate, setnameupdate] = useState(false);
	
	const [fullName, setFullName] = useState("");
	const [userName, setUserName] = useState("");
	const [profilePic, setProfilePic] = useState("");
	
	const [defaultfullName, setdefaultFullName] = useState("");
	const [defaultuserName, setdefaultUserName] = useState("");
	const [defaultProfilePic, setdefaultProfilePic] = useState("");
	
	const [isUpdated, setisUpdated] = useState(false);
	
	const[imagechangeActive, setImagechangeActive] = useState(false)
	const [imageUploaded , setImageUploaded] = useState<string | null>(null);
	const [croppedArea , setCroppedArea] = useState(null);
	const [crop, setCrop] = useState({x:0, y:0})
	const [zoom, setZoom] = useState(1)
	const [isimgUpdated, setisimgUpdated] = useState(false);
	const [isUploadLoadings, setIsUploadLoadings] = useState(false);

	useEffect(() => {
		// Add or remove the CSS class to the body element when popup state changes
		if (imagechangeActive) {
			document.body.classList.add('overflow-hidden');
		} else {
			document.body.classList.remove('overflow-hidden');
			setisimgUpdated(false);
			setImageUploaded(null);
			setZoom(1)
		}
	
		// Cleanup function to remove the class when the component unmounts
		return () => {
			document.body.classList.remove('overflow-hidden');
		};
	}, [imagechangeActive]);

	useEffect(() => {
		document.title = "Settings | Account Information";
	  }, []);

	// const fetchingUserData = async ()=>{
	// 	setIsLoading(true);
	// 	try {
	// 		const response = await fetch(`${theHost}:${port}/api/user/me/`, {
	// 			method: 'GET',
	// 			headers: {
	// 			'Content-Type': 'application/json',
	// 			'Authorization': `Bearer ${localStorage.getItem('access')}`,
	// 			}
	// 		});
		
	// 		if (!response.ok) {
	// 			throw new Error('Failed to fetch me');
	// 		}
		
	// 		const result = await response.json();
	// 		setFullName(result.user_data.full_name);
	// 		setUserName(result.user_data.username)
	// 		setProfilePic(`${theHost}:${port}` + result.user_data.profile_img)
	// 		setdefaultFullName(result.user_data.full_name);
	// 		setdefaultUserName(result.user_data.username)
	// 		setdefaultProfilePic(`${theHost}:${port}` + result.user_data.profile_img)
	// 		// setCookie('userData', JSON.stringify(result.user_data));
	// 		setCookie('userData', JSON.stringify(result.user_data), { 
	// 			path: '/', 
	// 			expires: new Date(Date.now() + 7 * 864e5) 
	// 		});
	// 	} catch (error:any) {
	// 			console.error('Error:', error.message);
	// 		}
	// 		finally{
	// 			setIsLoading(false)
	// 		}
	// }

	const fetchingUserData = async () => {
		setIsLoading(true);
		try {
			const response = await axiosAuth.get('/user/me/');
			const result = response.data;

			setFullName(result.user_data.full_name);
			setUserName(result.user_data.username);
			setProfilePic(`${theHost}:${port}${result.user_data.profile_img}`);
			setdefaultFullName(result.user_data.full_name);
			setdefaultUserName(result.user_data.username);
			setdefaultProfilePic(`${theHost}:${port}${result.user_data.profile_img}`);

			setCookie('userData', JSON.stringify(result.user_data), { 
				path: '/', 
				expires: new Date(Date.now() + 7 * 864e5) 
			});

		} catch (error) {
			if (error instanceof AxiosError) {
				// console.error('Error fetching user data:', error.response?.data || error.message);
			} else {
				// console.error('An unexpected error occurred:', error);
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(()=>{
		fetchingUserData()
	},[isUpdated])

	const check=() :boolean=>{
		return (userName != defaultuserName || fullName != defaultfullName)
	}

	const [data,setData] = useState<ValuesType>({id:cookies.userData.id})
	const [imgFile, setimgFile] = useState<FormData>()

	const updateIng = async () => {
		if (imageUploaded && croppedArea) {
				const croppedImageFile = await getCroppedImageFile(imageUploaded, croppedArea);
				if (croppedImageFile) {
					const options = {
						maxSizeMB: 2,
						maxWidthOrHeight: 650,
						useWebWorker: true,
					  };
					const compressedFile = await imageCompression(croppedImageFile , options);
					if(compressedFile){
						const formData = new FormData();
						formData.append('image', compressedFile);
						setimgFile(formData)
					}
				}
		}
	}

	const toastUP = (type:boolean, msg:string)=>{
		if (type)
			toast.success(msg,{containerId:'accountInfo'});
		else 
			toast.error(msg, {containerId:'accountInfo'});
	}
	
	useEffect(() => {
		if (!isLoading && !isLoadings && !isUploadLoadings && imageUploaded) {
			PicterFetch();
	  }
	}, [imgFile]);

	  const updateData = () => {
		const newData:ValuesType = { id: cookies.userData.id };
		setnameupdate(false);
		setuserupdate(false);
		if (fullName !== defaultfullName) {
			setnameupdate(true);
		  	newData.full_name = fullName;
		}
		if (userName !== defaultuserName) {
			setuserupdate(true)
		  newData.username = userName;
		}
		setData(newData);
	  };
 
	  useEffect(() => {
		  if (!isLoading && !isLoadings&&check()) {
			  AAhandle();
			}
	  }, [data]);

	  const [isRefrech, setisRefrech] = useState(false)
	  useEffect(()=>{
		errUser && toastUP(false,'Username already exists.');
		errUserinvalid && toastUP(false,'Invalid username.');
		errName && toastUP(false,'Invalid Full Name.');
	  },[isRefrech])

	//   const  AAhandle= async ()=>{
		
	// 	setIsLoadings(true);
	// 	try {
	// 		const response = await fetch(`${theHost}:${port}/api/user/change-my-info/`, {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				'Authorization': `Bearer ${localStorage.getItem('access')}`,
	// 			},
	// 			body: JSON.stringify(data),
	// 		});
	// 		const result = await response.json();
	// 		if("username" in result)
	// 		{
	// 			seterrUser(result["username"]["0"] === "user with this username already exists.");
	// 			seterrUserincalid(result["username"]["0"] === "Invalid username")
	// 		}
	// 		seterrName("full_name" in result);
	// 		if (!response.ok) {
	// 			setisRefrech(!isRefrech)
	// 			setnameupdate(false)
	// 			setuserupdate(false);
	// 			throw new Error('UserName Error.');
	// 		}
	// 		if (nameupdate)
	// 			toastUP(true,'Full Name Updated!');
	// 		if (userupdate)
	// 			toastUP(true,'Username Updated!'); 
	// 		setisUpdated(!isUpdated)
	// 	} catch(e){}
	// 	finally{
	// 		setIsLoadings(false);
	// 	}
	// }

	const AAhandle = async () => {
		setIsLoadings(true);
		try {
		  const response = await axiosAuth.post('/user/change-my-info/', data);
		  const result = response.data;
	  
		  if ("username" in result) {
			seterrUser(result.username[0] === "user with this username already exists.");
			seterrUserincalid(result.username[0] === "Invalid username");
		  }
		  seterrName("full_name" in result);
	  
		  if (nameupdate) {
			toastUP(true, 'Full Name Updated!');
		  }
		  if (userupdate) {
			toastUP(true, 'Username Updated!');
		  }
		  setisUpdated(!isUpdated);
		} catch (error) {
		  if (error instanceof AxiosError) {
			// console.error('Error updating user info:', error.response?.data || error.message);
			setisRefrech(!isRefrech);
			setnameupdate(false);
			setuserupdate(false);
	  
			if (error.response?.data) {
			  const errorData = error.response.data;
			  if ("username" in errorData) {
				seterrUser(errorData.username[0] === "user with this username already exists.");
				seterrUserincalid(errorData.username[0] === "Invalid username");
			}
			  seterrName("full_name" in errorData);
			}
		} else {
			// console.error('An unexpected error occurred:', error);
		}
		} finally {
			setIsLoadings(false);
		}
	};

	//   const  PicterFetch= async ()=>{
	// 	  setIsUploadLoadings(true);
	// 	  try {
	// 			const response = await fetch(`${theHost}:${port}/api/user/pic-upload/`, {
	// 				method: 'POST',
	// 				headers: {
	// 					'Authorization': `Bearer ${localStorage.getItem('access')}`,
	// 				},
	// 				body: imgFile,
	// 			});
	// 			if (!response.ok) {
	// 				console.log('response', response);
					
	// 				throw new Error('UserName Error.');
	// 			}
	// 			toastUP(true,'Image uploaded successefly!');
	// 			setisUpdated(!isUpdated);
	// 			setisimgUpdated(false);
	// 			setImagechangeActive(false);
	// 	} catch(e){}
	// 	finally{
	// 		setIsUploadLoadings(false);
	// 	}
	// }

	const PicterFetch = async () => {
		setIsUploadLoadings(true);
		try {
		await axiosAuth.post('/user/pic-upload/', imgFile, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		toastUP(true, 'Image uploaded successfully!');
		setisUpdated(!isUpdated);
		setisimgUpdated(false);
		setImagechangeActive(false);
		} catch (error) {
		if (error instanceof AxiosError) {
			// console.error('Error uploading image:', error.response?.data || error.message);
		} else {
			// console.error('An unexpected error occurred:', error);
		}
			toastUP(false, 'Failed to upload image. Please try again.');
		} finally {
			setIsUploadLoadings(false);
		}
	};

	const onCropComplete =(_:any, croppedAreaPix:any)=>{
		setCroppedArea(croppedAreaPix)
	}

	
	const imagechange= ()=>{
		return(
			<div className="fixed z-50  inset-0 flex items-center justify-center ">
				<div className="backdrop-blur-[2px]  bg-[#0000000e] dark:bg-[#ffffff2b]  min-w-full min-h-full absolute"  onClick={()=>{setImagechangeActive(false)}}></div>

					<div className="flex flex-col dark:bg-black bg-white rounded-xl w-80 items-center p-4 relative m-3" >
						<div className=" absolute right-2 top-2 text-xl cursor-pointer"  onClick={()=>{setImagechangeActive(false)}}><FaXmark /></div>
						<div className="text-xl text-bold text-center mt-3">Change Profile Picture</div>
						{
							isimgUpdated && <>
							<div className="flex w-full justify-center items-center mt-3 h-52 relative bg-[#4b4b4b]">
								{isimgUpdated && <Cropper image={String(imageUploaded)} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}/>}
								{!isimgUpdated && <img src={profilePic} alt="" className=" size-40 rounded-full border border-black dark:border-white"/>}
							</div>
							<input type="range"
								id="rangeInput"
								name="rangeInput"
								min="1"
								max="3"
								step="0.05"
								value={zoom}
								onChange={(e)=>{
									setZoom(Number(e.target.value))
								}}
								className="w-full h-1 mb-6 mt-6 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm dark:bg-[#868686]"/>
							</>
						}
						{!isimgUpdated && <>
							<div className="flex w-full justify-center items-center mt-3 h-52 relative">
								<img src={profilePic} alt="" className=" size-40 rounded-full border border-black dark:border-white"/>
							</div>
						</>}

						<div className="flex  gap-2 mt-2 w-full justify-center items-center">
							<input type="file" accept="image/" className="hidden" ref={picupload} onChange={
								(e)=>{
									if(e.target.files && e.target.files.length > 0){
										const reader = new FileReader();
										reader.readAsDataURL(e.target.files[0])
										reader.addEventListener('load',()=>{
											if (typeof reader.result === 'string') {
												setImageUploaded(reader.result);
												setisimgUpdated(true);
												setZoom(1)
											  }
										})
									}
								}
							}/>
							<button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d] max-w-40" type="button" onClick={()=>{
								picupload.current?.click()
							}}>Upload</button>
							{isimgUpdated && <button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d] max-w-40" type="button" onClick={()=>{
								if (imageUploaded && croppedArea)
									updateIng();
							}}>Save</button>}
						</div>
						

					</div>
				</div>
		)
	}
	return ( 
		
			<form className="shrink mx-5  flex flex-col w-full items-center mt-5 max-w-96 pb-5"
			onSubmit={(e)=>{e.preventDefault();
				if(check())
					updateData()
			}} 
			onReset={()=>{
				seterrName(false)
				seterrUser(false)
				seterrUserincalid(false)
				setFullName(defaultfullName)
				setUserName(defaultuserName)
				setProfilePic(defaultProfilePic)
			}}
			>
				{ isWide && <div className="flex items-center  justify-center  font-bold text-4xl text-center">Account Information</div>}
					<div className="flex gap-3 flex-col items-center mobile:mt-5">
					<div className="size-24 rounded-full border border-black dark:border-white " >
						{
							profilePic ? <img src={`${profilePic}?${new Date().getTime()}`} alt="" className="size-24 rounded-full border border-black dark:border-white"/> :
							<div className="size-24 rounded-full border border-black dark:border-white  animate-pulse bg-[#989898]"></div>
						}
					</div>
					<div className="flex flex-col gap-2 justify-center">
						<button className="bg-black dark:bg-white w-40 h-10 rounded-xl dark:text-black text-white flex items-center justify-center  hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d] relative z-0" type="button" onClick={()=>{
							setImagechangeActive(true)
						}}>Upload</button>
						
					</div>
				</div>
				<div className="flex flex-col mt-4 mb-4 w-full">
					<div className="ml-3 ">Full Name</div>
					<input className="border dark:border-[#292929] h-12  rounded-2xl w-full p-5 dark:bg-black dark:text-white"
					onChange={(e) => {
						setFullName(e.target.value );
						seterrName(false)
						setnameupdate(false)
						seterrName(false)
						seterrUser(false)
						seterrUserincalid(false)
					}}
					value={fullName}
					name= "FullName"
					type= "text"
					placeholder= "Full Name"
					minLength={4}
					maxLength={50}
					pattern="[a-zA-Z0-9 ]{4,50}"
					title="Please enter only alphanumeric characters, digits, or spaces (4 to 50 characters long)" required
					/>
				</div>
				<div className="flex flex-col w-full mb-4">
					<div className="ml-3">Username</div>
					<input className="border dark:border-[#292929] h-12 rounded-2xl w-full p-5 dark:bg-black dark:text-white"
					onChange={(e) => {
						setUserName( e.target.value);
						seterrUser(false)
						setuserupdate(false);
						seterrName(false)
						seterrUser(false)
						seterrUserincalid(false) 
					}}
					value={userName}
					name= "UserName"
					type= "text"
					placeholder= "Username"
					minLength={3}
					maxLength={30}
					title="Please enter only alphanumeric characters (3 to 30 characters long)"
					required pattern="[a-zA-Z0-9]{3,30}"
					/>
				</div>
				<div className="flex  gap-2 mt-2 w-full justify-end items-center">
						<button className="dark:bg-black bg-white flex-1 h-10 rounded-xl text-black dark:text-white flex items-center justify-center hover:dark:bg-[#212121] active:dark:bg-[#797979] hover:bg-[#cecdcd] active:bg-[#9d9d9d]" type="reset">Discard</button>
						<button className="bg-black dark:bg-white flex-1 h-10 rounded-xl dark:text-black text-white flex items-center justify-center hover:bg-[#212121] active:bg-[#797979] dark:hover:bg-[#cecdcd] dark:active:bg-[#9d9d9d]" type="submit" >Save</button>
				</div>	
				{imagechangeActive && imagechange()}
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
					containerId="accountInfo"
			/>
			</form>
			
	 );
}

export default AccountInfo;