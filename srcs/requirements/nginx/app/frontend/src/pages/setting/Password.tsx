import { useState  } from "react";
import { PasswordContext} from "./context/passwordcontext";
import FormMainPass from "./Password/FormMainPass";
import FormForgetPassword from "./Password/FormForgetPassword";
import FormChangePass from "./Password/FormChangePass";



const Password = () =>{

	const [TheState, setTheState] = useState<string>("main");
	const [cancelKlick, setcancelKlick] = useState(true);
	const [email, setEmail] = useState<string>('');
	const [isupdated, setIsupdated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSuccess, setisSuccess] = useState(false);

	return (
		<>
		<PasswordContext.Provider value={{isSuccess, setisSuccess, TheState, setTheState, cancelKlick, setcancelKlick, email, setEmail, isupdated, setIsupdated, isLoading, setIsLoading}}>
			{TheState === "main" && <FormMainPass/>}
			{TheState === "forgetPassword" && <FormForgetPassword/>}
			{TheState === "changePass" && <FormChangePass/>}
		</PasswordContext.Provider>
	

		</>
	)
}

export default Password