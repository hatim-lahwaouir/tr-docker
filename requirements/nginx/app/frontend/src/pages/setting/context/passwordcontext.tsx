import { createContext, useState, ReactNode, useContext } from 'react';

// Define the type for the context value
interface PasswordContextType {

	TheState: string;
	setTheState: (value: string) => void;
	cancelKlick: boolean;
	setcancelKlick: (value: boolean) => void;
	email:string;
	setEmail: (value: string) => void;
	isupdated:boolean;
	setIsupdated: (value: boolean) => void;
	isLoading:boolean
	setIsLoading: (value: boolean) => void;
	isSuccess: boolean;
	setisSuccess: (value: boolean) => void;
}


// Create the context with a default value
const PasswordContext = createContext<PasswordContextType | undefined>(undefined);


const usePasswordContext = () => {
	const context = useContext(PasswordContext);
	if (!context) {
		throw new Error('useMyContext must be used within a MyContextProvider');
	}
	return context;
  };

// Create the provider component
const PasswordContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [TheState, setTheState] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [cancelKlick, setcancelKlick] = useState(true);
  const [isupdated, setIsupdated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setisSuccess] = useState(true);

  return (
    <PasswordContext.Provider value={{isSuccess, setisSuccess, TheState, setTheState, cancelKlick, setcancelKlick, email, setEmail, isupdated, setIsupdated, isLoading, setIsLoading}}>
      {children}
    </PasswordContext.Provider>
  );
};

export { PasswordContext, PasswordContextProvider, usePasswordContext };