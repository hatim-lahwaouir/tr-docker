import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';

// Lazy load components
const Home = lazy(() => import("./pages/home/Home"));
const ChatPage = lazy(() => import("./pages/chat/ChatPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const GamePage = lazy(() => import("./pages/game/GamePage"));
const GameLocal = lazy(() => import("./pages/game/GameLocal"));
const GameTournamentLocal = lazy(() => import("./pages/game/GameTournamentLocal"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const SettingNew = lazy(() => import("./pages/setting/Settings"));
const GameHome = lazy(() => import("./pages/game/GameHome"));
const GamePlayerLobby = lazy(() => import("./pages/game/GamePlayerLobby"));
const GameTounamentLobby = lazy(() => import("./pages/game/GameTounamentLobby"));
const ChooseOpponents = lazy(() => import("./pages/game/GameLobby"));
const Tournament = lazy(() => import('./pages/game/Tournament'));
const TournamentLocal = lazy(() => import('./pages/game/TournamentLocal'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Loading = lazy(() => import('./components/loading/Loading'));
const ProtectedGameRoute = lazy(() => import('./components/ProtectedGameRoute'));
const NotFoundPage = lazy(() => import('./pages/error/NotFoundPage'));
const RockPaperScissors = lazy(() => import('./pages/game/RPS/RockPaperScissors'));
const WaitingRoom = lazy(() => import('./pages/game/RPS/WaitingRoom'));

// Import context providers
import WebSocketProvider  from './context/WebSocketContext';
import ProfileProvider from "./context/ProfileContext";
import ChatProvider from "./context/ChatContext";
import NavbarContextProvider from "./context/NavbarContext";
import GameProvider from "./context/GameContext";
import TounamentContextProvider from './context/TounamentContext';
import LocationTracker from './components/LocationTracker';
import Navbar from './pages/NavBars/Navbar';
import { axiosAuth, useCustomNavigate } from './api/axiosAuth';
import Games from './pages/game/Games';
import ProtectedRPSRoute from './components/ProtectedRPSRoute';
import { RockPaperScissorsProvider } from './context/RockPaperScissorsContext';
import TounamentLocalContextProvider from './context/TounamentLocalContext';

function App() {
  const [cookies] = useCookies(['userData']);
  const isLoggedIn = !!cookies.userData &&
                     !!localStorage.getItem('refresh');

   const clearCookies = () => {
    document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const customNavigate = useCustomNavigate();

  useEffect(() => {
    axiosAuth.setNavigateToLogin(() => customNavigate('/login'));
  }, [customNavigate]);

  const location = useLocation();

  if (!isLoggedIn) {
    clearCookies();
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    return (
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/resetpassword" element={<ResetPasswordPage />} />
          <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <WebSocketProvider>
      <ProfileProvider>
        <GameProvider>
          <NavbarContextProvider>
            <ChatProvider>
              <TounamentContextProvider>
                <TounamentLocalContextProvider>
                  <Suspense fallback={<Loading />}>
                    <LocationTracker>
                      {location.pathname !== '/NotFoundPage' && <Navbar />}
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/profile/:id" element={<Profile />} />
                        <Route path="/chat/:id" element={<ChatPage />} />
                        <Route path="/games" element={<Games />} />
                        <Route path="/game" element={<GameHome />} />
                        <Route path="/game-lobby/:id" element={<ChooseOpponents />} />
                        <Route path="/game-play" element={<GamePlayerLobby />} />
                        <Route path="/tounament-lobby" element= {<GameTounamentLobby />}/>
                        <Route path="/game-local" element={<GameLocal />} />
                        <Route path="/game-tounament-local" element= {<GameTournamentLocal />}/>
                        <Route path="/tournament" element={<Tournament />} />
                        <Route path="/tournament_local" element={<TournamentLocal />} />
                        <Route path="/game/:gameId" element={
                          <ProtectedGameRoute>
                            <GamePage />
                          </ProtectedGameRoute>
                        } />
                        <Route path="/WaitingRoom" element={
                          <RockPaperScissorsProvider>
                            <ProtectedRPSRoute>
                              <WaitingRoom />
                            </ProtectedRPSRoute>
                          </RockPaperScissorsProvider>
                        } />
                        <Route path="/SecondGame" element={
                          <RockPaperScissorsProvider>
                            <ProtectedRPSRoute>
                              <RockPaperScissors />
                            </ProtectedRPSRoute>
                          </RockPaperScissorsProvider>
                        } />
                        <Route path="/setting" element={<SettingNew />} />
                        <Route path="/NotFoundPage" element={<NotFoundPage />} />
                        <Route path="*" element={<Navigate to="/NotFoundPage" replace />} />
                      </Routes>
                    </LocationTracker>
                  </Suspense>
                </TounamentLocalContextProvider>
              </TounamentContextProvider>
            </ChatProvider>
          </NavbarContextProvider>
        </GameProvider>
      </ProfileProvider>
    </WebSocketProvider>
  );
}

export default App;



// import { Suspense, lazy, useEffect } from 'react';
// import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
// import { useCookies } from 'react-cookie';

// // Lazy load components
// const Home = lazy(() => import("./pages/home/Home"));
// const ChatPage = lazy(() => import("./pages/chat/ChatPage"));
// const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
// const GamePage = lazy(() => import("./pages/game/GamePage"));
// const GameLocal = lazy(() => import("./pages/game/GameLocal"));
// const GameTournamentLocal = lazy(() => import("./pages/game/GameTournamentLocal"));
// const Profile = lazy(() => import("./pages/profile/Profile"));
// const SettingNew = lazy(() => import("./pages/setting/Settings"));
// const GameHome = lazy(() => import("./pages/game/GameHome"));
// const GamePlayerLobby = lazy(() => import("./pages/game/GamePlayerLobby"));
// const GameTounamentLobby = lazy(() => import("./pages/game/GameTounamentLobby"));
// const ChooseOpponents = lazy(() => import("./pages/game/GameLobby"));
// const Tournament = lazy(() => import('./pages/game/Tournament'));
// const TournamentLocal = lazy(() => import('./pages/game/TournamentLocal'));
// const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
// const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
// const LandingPage = lazy(() => import('./pages/LandingPage'));
// const Loading = lazy(() => import('./components/loading/Loading'));
// const ProtectedGameRoute = lazy(() => import('./components/ProtectedGameRoute'));
// const NotFoundPage = lazy(() => import('./pages/error/NotFoundPage'));

// // Import context providers
// import WebSocketProvider  from './context/WebSocketContext';
// import ProfileProvider from "./context/ProfileContext";
// import ChatProvider from "./context/ChatContext";
// import NavbarContextProvider from "./context/NavbarContext";
// import GameProvider from "./context/GameContext";
// import TounamentContextProvider from './context/TounamentContext';
// import LocationTracker from './components/LocationTracker';
// import Navbar from './pages/NavBars/Navbar';
// import { axiosAuth, useCustomNavigate } from './api/axiosAuth';
// import TounamentLocalContextProvider from './context/TounamentLocalContext';

// function App() {
//   const [cookies] = useCookies(['userData']);
//   const isLoggedIn = !!cookies.userData &&
//                      !!localStorage.getItem('refresh');

//    const clearCookies = () => {
//     document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//   };

//   const customNavigate = useCustomNavigate();

//   useEffect(() => {
//     axiosAuth.setNavigateToLogin(() => customNavigate('/login'));
//   }, [customNavigate]);

//   const location = useLocation();

//   if (!isLoggedIn) {
//     clearCookies();
//     localStorage.removeItem('access');
//     localStorage.removeItem('refresh');
//     return (
//       <Suspense fallback={<Loading />}>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
//           <Route path="/resetpassword" element={<ResetPasswordPage />} />
//           <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
//           <Route path="*" element={<Navigate to="/login" replace />} />
//         </Routes>
//       </Suspense>
//     );
//   }

//   return (
//     <WebSocketProvider>
//       <ProfileProvider>
//         <GameProvider>
//               <NavbarContextProvider>
//           <ChatProvider>
//             <TounamentContextProvider>
//               <TounamentLocalContextProvider>
//                 <Suspense fallback={<Loading />}>
//                   <LocationTracker>
//                   {/* <Navbar /> */}
//                   {location.pathname !== '/NotFoundPage' && <Navbar />}
//                   <Routes>
//                     <Route path="/" element={<Home />} />
//                     <Route path="/profile/:id" element={<Profile />} />
//                     <Route path="/chat/:id" element={<ChatPage />} />
//                     <Route path="/game" element={<GameHome />} />
//                     <Route path="/game-lobby/:id" element= {<ChooseOpponents />}/>
//                     <Route path="/game-play" element= {<GamePlayerLobby />}/>
//                     <Route path="/tounament-lobby" element= {<GameTounamentLobby />}/>
//                     <Route path="/game-local" element= {<GameLocal />}/>
//                     <Route path="/game-tounament-local" element= {<GameTournamentLocal />}/>
//                     <Route path="/tournament" element={<Tournament />} />
//                     <Route path="/tournament_local" element={<TournamentLocal />} />
//                     <Route path="/game/:gameId" element={
//                       <ProtectedGameRoute>
//                         <GamePage />
//                       </ProtectedGameRoute>
//                     } />
//                     <Route path="/setting" element={<SettingNew />} />
//                     <Route path="/NotFoundPage" element={<NotFoundPage />} />
//                     <Route path="*" element={<Navigate to="/NotFoundPage" replace />} />
//                   </Routes>
//                     </LocationTracker>
//                 </Suspense>
//             </TounamentLocalContextProvider>
//             </TounamentContextProvider>
//           </ChatProvider>
//               </NavbarContextProvider>
//         </GameProvider>
//       </ProfileProvider>
//     </WebSocketProvider>
//   );
// }

// export default App;