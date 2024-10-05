import { useState, useEffect} from "react";
import FormMain from "./Security/FormMain";
import FormPassVerify from "./Security/FormPassVerify";
import FormAuthApp from "./Security/FormAuthApp";
import { SecurityContext } from "./context/securitycontext";
import 'react-toastify/dist/ReactToastify.css';
import { axiosAuth } from "../../api/axiosAuth";
import { AxiosError } from "axios";

interface _2fa{
	
	'2fa':string;
}
const Security = () =>{

		const [defaultValue, setdefaultValue] = useState<string>('');
		const [isLoading, setIsLoasing] = useState(true);
		const [cancelKlick, setcancelKlick] = useState(true);
		const [uriAA, setUriAA] = useState<string>('');
		const [keyAA, setKeyAA] = useState<string>('');
		const [isSuccess, setisSuccess] = useState(false);

		useEffect(() => {
			document.title = "Settings | Security";
		  }, []);

		// const festch2fa = async ()=>{
		// 	setIsLoasing(true);
		// 	try {
		// 		const response = await fetch(`${theHost}:${port}/api/user/2fa-info/`, {
		// 			method: 'GET',
		// 			headers: {
		// 			'Content-Type': 'application/json',
		// 			'Authorization': `Bearer ${localStorage.getItem('access')}`,
		// 			},
		// 		});
			
		// 		if (!response.ok) {
		// 			throw new Error('Failed to fetch 2FA');
		// 		}
			
		// 		const result = await response.json()as _2fa;
		// 		setdefaultValue(result["2fa"])
		// 		setSelectedValue(result["2fa"])
		// 	} catch (error:any) {
		// 			console.error('Error:', error.message);
		// 		}
		// 		finally{
		// 			setIsLoasing(false)
		// 		}
		// }

		const fetch2fa = async () => {
			setIsLoasing(true);
			try {
				const response = await axiosAuth.get<_2fa>('/user/2fa-info/');
				const result = response.data;
				setdefaultValue(result["2fa"]);
				setSelectedValue(result["2fa"]);
			} catch (error) {
			if (error instanceof AxiosError) {
				// console.error('Error fetching 2FA info:', error.response?.data || error.message);
			} else {
				// console.error('An unexpected error occurred:', error);
			}
			} finally {
				setIsLoasing(false);
			}
		};

		useEffect(()=>{
			fetch2fa()
		},[cancelKlick])
		

		const [selectedValue, setSelectedValue] = useState<string>(defaultValue);

		const [TheState, setTheState] = useState<string>("main");
		if(TheState === "main" && !isLoading)
			return(
				<>
				<SecurityContext.Provider value={{ isSuccess, setisSuccess, defaultValue, setdefaultValue, selectedValue, setSelectedValue, TheState, setTheState, cancelKlick,setcancelKlick , uriAA, setUriAA, keyAA, setKeyAA}}>
				<FormMain/>
				</SecurityContext.Provider>
				</>
			)
	return (
		<>
		
		<SecurityContext.Provider value={{ isSuccess, setisSuccess,defaultValue, setdefaultValue, selectedValue, setSelectedValue, TheState, setTheState, cancelKlick,setcancelKlick , uriAA, setUriAA, keyAA, setKeyAA}}>
		{TheState === "PassVerify" && <FormPassVerify />}
		{TheState === "App" && <FormAuthApp/> }
		</SecurityContext.Provider>
		</>
	)

}

export default Security;