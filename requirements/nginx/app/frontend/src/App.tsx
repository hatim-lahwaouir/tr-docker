import { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';

// Direct imports instead of lazy loading
import Home from "./pages/home/Home";
import ChatPage from "./pages/chat/ChatPage";
import LoginPage from "./pages/auth/LoginPage";
import GamePage from "./pages/game/GamePage";
import GameLocal from "./pages/game/GameLocal";
import GameTournamentLocal from "./pages/game/GameTournamentLocal";
import Profile from "./pages/profile/Profile";
import SettingNew from "./pages/setting/Settings";
import GameHome from "./pages/game/GameHome";
import GamePlayerLobby from "./pages/game/GamePlayerLobby";
import GameTounamentLobby from "./pages/game/GameTounamentLobby";
import ChooseOpponents from "./pages/game/GameLobby";
import Tournament from './pages/game/Tournament';
import TournamentLocal from './pages/game/TournamentLocal';
import SignupPage from './pages/auth/SignupPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import LandingPage from './pages/LandingPage';
import ProtectedGameRoute from './components/ProtectedGameRoute';
import NotFoundPage from './pages/error/NotFoundPage';
import RockPaperScissors from './pages/game/RPS/RockPaperScissors';
import WaitingRoom from './pages/game/RPS/WaitingRoom';

// Import context providers
import WebSocketProvider from './context/WebSocketContext';
import ProfileProvider from "./context/ProfileContext";
import ChatProvider from "./context/ChatContext";
import NavbarContextProvider from "./context/NavbarContext";
import GameProvider from "./context/GameContext";
import TounamentContextProvider from './context/TounamentContext';
import TounamentLocalContextProvider from './context/TounamentLocalContext';
import LocationTracker from './components/LocationTracker';
import Navbar from './pages/NavBars/Navbar';
import { axiosAuth, useCustomNavigate } from './api/axiosAuth';
import Games from './pages/game/Games';
import ProtectedRPSRoute from './components/ProtectedRPSRoute';
import { RockPaperScissorsProvider } from './context/RockPaperScissorsContext';

function App() {
  const [cookies] = useCookies(['userData']);
  const isLoggedIn = !!cookies.userData && !!localStorage.getItem('refresh');
  const customNavigate = useCustomNavigate();
  const location = useLocation();

  const clearCookies = () => {
    document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  useEffect(() => {
    axiosAuth.setNavigateToLogin(() => customNavigate('/login'));
  }, [customNavigate]);

  if (!isLoggedIn) {
    clearCookies();
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    return (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/resetpassword" element={<ResetPasswordPage />} />
          <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
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
                        <Route path="/tounament-lobby" element={<GameTounamentLobby />}/>
                        <Route path="/game-local" element={<GameLocal />} />
                        <Route path="/game-tounament-local" element={<GameTournamentLocal />}/>
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