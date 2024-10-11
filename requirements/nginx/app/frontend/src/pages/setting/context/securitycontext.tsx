import { createContext, useState, ReactNode } from 'react';

// Define the type for the context value
interface SecurityContextType {
  defaultValue: string;
  setdefaultValue: (value: string) => void;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  TheState: string;
  setTheState: (value: string) => void;
  cancelKlick: boolean;
  setcancelKlick: (value: boolean) => void;
  isSuccess: boolean;
  setisSuccess: (value: boolean) => void;
  uriAA: string;
  setUriAA: (value: string) => void;
  keyAA: string;
  setKeyAA: (value: string) => void;
}

// Create the context with a default value
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Create the provider component
const SecurityContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [defaultValue, setdefaultValue] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [uriAA, setUriAA] = useState<string>('');
  const [keyAA, setKeyAA] = useState<string>('');
  const [TheState, setTheState] = useState<string>('');
  const [cancelKlick, setcancelKlick] = useState(true);
  const [isSuccess, setisSuccess] = useState(true);

  return (
    <SecurityContext.Provider value={{ isSuccess, setisSuccess,defaultValue, setdefaultValue, selectedValue, setSelectedValue, TheState, setTheState, cancelKlick, setcancelKlick, uriAA, setUriAA, keyAA, setKeyAA}}>
      {children}
    </SecurityContext.Provider>
  );
};

export { SecurityContext, SecurityContextProvider };
