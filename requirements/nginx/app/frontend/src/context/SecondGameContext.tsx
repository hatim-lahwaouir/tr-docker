// import { createContext, useContext, useState } from 'react';

// interface SecondGameContextType {

// }

// const SecondGameContext = createContext<SecondGameContextType | undefined>(undefined);

// export const useSecondGameContext = () => {
//   const context = useContext(SecondGameContext);
//   if (!context) {
//     throw new Error('useSecondGameContext must be used within a ProfileProvider');
//   }
//   return context;
// };

// const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

//     const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'playing'>('waiting');


//   const contextValue: SecondGameContextType = {
//     ,
//   };

//   return (
//     <SecondGameContext.Provider value={contextValue}>
//       {children}
//     </SecondGameContext.Provider>
//   );
// };

// export default ProfileProvider;