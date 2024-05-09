import React, { useEffect } from 'react'; // Assurez-vous d'importer useEffect
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { useAuth } from './authContexte/AuthContext';
import Topbar from './scenes/global/Topbar';
import Dashboard from './scenes/dashbord';
import Sidebar from './scenes/global/Sidebar';
import Team from "./scenes/team";
import Contacts from "./scenes/contacts";
import Invoices from "./scenes/invoices";
import Form from "./scenes/form";
import Calendar from "./scenes/calendar";
import FAQ from "./scenes/faq";
import Bar from "./scenes/bar";
import Pie from "./scenes/pie";
import Line from "./scenes/line";
import Geography from "./scenes/geography";
import Ping from "./scenes/ping";
import LatencyAnalysis from "./scenes/latence";
import ModifyEquipment from "./scenes/ModifyEquipment";
import ModifyConfig from "./scenes/ModifyConfig";
import ModifyUser from "./scenes/ModifyUser";
import Intervention from "./scenes/intervention";
import Listes from "./scenes/liste";
import Config from "./scenes/config";
import Topologie from "./scenes/Topologie";
import InterventionDetails from "./scenes/InterventionDetails"; // Importez le nouveau composant
import { SnackbarProvider } from 'notistack';
import Alert from "./scenes/alert"
import LoginForm  from './scenes/LoginForm/LoginForm';
import User from "./scenes/user";
import ResetPasswordForm from "./scenes/forgot";
import ForgotPasswordForm from "./scenes/password";
import TTLStatsPieChart from "./components/Pie";

function App() {
  const [theme, colorMode] = useMode();
  const { currentUser } = useAuth();
  const location = useLocation(); 
  const isLoginPage = location.pathname === '/';
  const isForgotPasswordPage = location.pathname === '/forgot' || location.pathname === '/password';

   // Ajout du useEffect pour logger le rôle de l'utilisateur courant
   useEffect(() => {
    console.log("Current user role:", currentUser?.role);
  }, [currentUser]);

  return (
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3}>
            <CssBaseline />
            <div className="app">
              {!isLoginPage && !isForgotPasswordPage && <Sidebar />}
              <main className={isForgotPasswordPage ? "content-full" : "content"}>
                {!isLoginPage && !isForgotPasswordPage && <Topbar />}
                <Routes>
                  <Route path="/" element={<LoginForm />} />
                  {currentUser ? (
                    
                    <>
                      {currentUser.role === 'technicienReseau' && (
                        <>
                         <Route path="/forgot" element={ <ResetPasswordForm/>} />
                          <Route path="/password" element={ <ForgotPasswordForm/>} />
                          <Route path="/dashboard" element={<Dashboard />} />
                         
                          <Route path="/team" element={<Team />} />
                          <Route path="/" element={<Team />} />
                          <Route path="/liste" element={<Listes />} />
                          <Route path="/listes" element={<Listes />} />
                          <Route path="/intervention" element={<Intervention />} />
                          <Route path="/config" element={<Config />} />
                          <Route path="/alert" element={<Alert />} />
                          <Route path="/alert/:equipmentId" element={<Alert />} />
                          <Route path="/pie/:equipmentId" element={<Pie />} />
                          <Route path="/ping" element={<Ping />} />
                          <Route path="/Topologie" element={<Topologie />} />
                          <Route path="/ping/:equipmentId" element={<Ping />} />
                          <Route path="/liste" element={<Listes />} />
                          <Route path="/listes" element={<Listes />} />
                          <Route path="/contacts" element={<Contacts />} />
                          <Route path="/InterventionDetails" element={< InterventionDetails/>} />
                          <Route path="/geography" element={<Geography />} />
                          <Route path="/Pie" element={<TTLStatsPieChart />} />
                          <Route path="*" element={<Navigate replace to="/dashboard" />} />
                        </>
                      )}
                        <Route path="*" element={<Navigate replace to="/dashboard" />} />
                      {currentUser.role == 'adminSystem' && (
                        <>
                          {/* Ici, vous pouvez ajouter des routes pour d'autres rôles si nécessaire */}
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/forgot" element={ <ResetPasswordForm/>} />
                          <Route path="/password" element={ <ForgotPasswordForm/>} />
                          <Route path="/user" element={< User/>} />
                          <Route path="/form" element={< Form/>} />
                          <Route path="//modify-user/:id" element={<ModifyUser />} />
                          <Route path="/bar" element={<Bar />} />
                <Route path="/pie" element={<Pie />} />
                <Route path="/line" element={<Line />} />
                          <Route path="*" element={<Navigate replace to="/dashboard" />} />
                        </>
                      )}
                      
                    </>
                  ) : (
                    <Route path="*" element={<Navigate replace to="/dashboard" />} />
                  )}
                  
                </Routes>
              </main>
            </div>
          </SnackbarProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    );
  }
  
  export default App;