import React, { useEffect } from 'react'; 
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { useAuth } from './authContexte/AuthContext';
import Topbar from './scenes/global/Topbar';
import Dashboard from './scenes/dashbord';
import Sidebar from './scenes/global/Sidebar';
import Team from "./scenes/equipListe";
import Contacts from "./scenes/equipForm";
import Invoices from "./scenes/formConfig";
import Form from "./scenes/userForm";
import Calendar from "./scenes/calendar";
import Bar from "./scenes/bar";
import Pie from "./scenes/pie";
import Line from "./scenes/line";
import Ping from "./scenes/ping";
import ModifyEquipment from "./scenes/ModifyEquipment";
import ModifyConfig from "./scenes/ModifyConfig";
import ModifyUser from "./scenes/ModifyUser";
import Intervention from "./scenes/intervention";
import Liste from "./scenes/liste";
import Config from "./scenes/config";
import InterventionDetails from "./scenes/InterventionDetails";
import { SnackbarProvider } from 'notistack';
import Alert from "./scenes/alert";
import LoginForm from './scenes/LoginForm/LoginForm';
import User from "./scenes/user";
import ResetPasswordForm from "./scenes/forgot";
import ForgotPasswordForm from "./scenes/password";
import TTLStatsPieChart from "./components/Pie";
import Inventory from "./scenes/Inventory";
import InventoryList from './scenes/count';
import Topologi from './scenes/topologi'

function App() {
  const [theme, colorMode] = useMode();
  const { currentUser } = useAuth();
  const location = useLocation(); 
  const isLoginPage = location.pathname === '/';
  const isForgotPasswordPage = location.pathname === '/forgot' || location.pathname === '/password';

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
                        <Route path="/forgot" element={<ResetPasswordForm />} />
                        <Route path="/password" element={<ForgotPasswordForm />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
           
                        <Route path="/team" element={<Team />} />
                        <Route path="/topologi" element={<Topologi />} />
                        <Route path="/count" element={< InventoryList/>} />
                        <Route path="/liste" element={<Liste />} />
                        <Route path="/intervention" element={<Intervention />} />
                        <Route path="/config" element={<Config />} />
                        <Route path="/alert" element={<Alert />} />
                        <Route path="/alert/:equipmentId" element={<Alert />} />
                        <Route path="/pie/:equipmentId" element={<Pie />} />
                        <Route path="/ping" element={<Ping />} />
                        <Route path="/ping/:equipmentId" element={<Ping />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/liste/:id" element={<InterventionDetails />} />
                        <Route path="/Pie" element={<TTLStatsPieChart />} />
                        <Route path="*" element={<Navigate replace to="/dashboard" />} />
                      </>
                    )}
                    {currentUser.role === 'admin' && (
                      <>
                        <Route path="/forgot" element={<ResetPasswordForm />} />
                        <Route path="/password" element={<ForgotPasswordForm />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                     
                        <Route path="/team" element={<Team />} />
                        <Route path="/liste" element={<Liste />} />
                        <Route path="/intervention" element={<Intervention />} />
                        <Route path="/config" element={<Config />} />
                        <Route path="/alert" element={<Alert />} />
                        <Route path="/alert/:equipmentId" element={<Alert />} />
                        <Route path="/count" element={< InventoryList/>} />
                        <Route path="/topologi" element={<Topologi />} />
                        <Route path="/pie/:equipmentId" element={<Pie />} />
                        <Route path="/ping" element={<Ping />} />
                        <Route path="/formconfig/:id" element={< Invoices/>} />
                        <Route path="/ping/:equipmentId" element={<Ping />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/liste/:id" element={<InterventionDetails />} />
                        <Route path="/Pie" element={<TTLStatsPieChart />} />
                        <Route path="/user" element={<User />} />
                        <Route path="/form" element={<Form />} />
                        <Route path="/modify-user/:id" element={<ModifyUser />} />
                        <Route path="/modify/:id" element={<ModifyEquipment />} />
                        <Route path="/modify-config/:id" element={<ModifyConfig />} />
                        <Route path="/bar" element={<Bar />} />
                        <Route path="/pie" element={<Pie />} />
                        <Route path="/PieChart" element={<TTLStatsPieChart />} />
                        <Route path="/line" element={<Line />} />
                        <Route path="/calendar" element={< Calendar/>} />
                        <Route path="*" element={<Navigate replace to="/dashboard" />} />
                      </>
                    )}
                    {currentUser.role === 'adminSystem' && (
                      <>
                        <Route path="/forgot" element={<ResetPasswordForm />} />
                        <Route path="/password" element={<ForgotPasswordForm />} />
                        <Route path="/user" element={<User />} />
                        <Route path="/form" element={<Form />} />
                        <Route path="/modify-user/:id" element={<ModifyUser />} />
                        <Route path="/calendar" element={< Calendar/>} />
                        <Route path="*" element={<Navigate replace to="/user" />} />
                      </>
                    )}
                  </>
                ) : (
                  <Route path="*" element={<Navigate replace to="/" />} />
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
