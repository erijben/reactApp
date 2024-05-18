import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Topbar from './scenes/global/Topbar';
import  Dashboard  from './scenes/dashbord';
import Sidebar from './scenes/global/Sidebar';
import { Route, Routes } from "react-router-dom";
import Team from "./scenes/team";
import Contacts from "./scenes/contacts";
import Invoices from "./scenes/invoices";
import Form from "./scenes/form";
import Calendar from "./scenes/calendar";
import Bar from "./scenes/bar";
import Pie from "./scenes/pie";
import Line from "./scenes/line";
import Ping from "./scenes/ping";
import ModifyEquipment from "./scenes/ModifyEquipment";
import ModifyConfig from "./scenes/ModifyConfig";
import ModifyUser from "./scenes/ModifyUser";
import Intervention from "./scenes/intervention";
import Listes from "./scenes/liste";
import Config from "./scenes/config";
import InterventionDetails from "./scenes/InterventionDetails"; // Importez le nouveau composant
import { SnackbarProvider } from 'notistack';
import Alert from "./scenes/alert"
import LoginForm  from './scenes/LoginForm/LoginForm';
import { useLocation } from "react-router-dom";
import User from "./scenes/user";
import ResetPasswordForm from "./scenes/forgot";
import ForgotPasswordForm from "./scenes/password";
import TTLStatsPieChart  from "./components/Pie";
import Topologi from "./scenes/topologi";


function App() {
  const [theme, colorMode] = useMode();
  const location = useLocation(); 

  const isLoginPage = location.pathname === '/';
const isForgotPasswordPage = location.pathname === '/forgot' || location.pathname === '/password';
 return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}> 
        <CssBaseline />
    
        <div className="app">
        {!isLoginPage && !isForgotPasswordPage && <Sidebar/>}
  <main className={isForgotPasswordPage ? "content-full" : "content"}>
    {!isLoginPage && !isForgotPasswordPage && <Topbar/>}

                <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/team" element={<Team />} />
               <Route path ="/dashboard" element ={<Dashboard/>}/>
                <Route path ="/team" element ={<Team/>}/>
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/form" element={<Form />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/bar" element={<Bar />} />
                <Route path="/pie" element={<Pie />} />
                <Route path="/line" element={<Line />} />
                <Route path="/ping" element={<Ping />} />
                <Route path="/ping/:equipmentId" element={<Ping />} />
                <Route path="/modify/:id" element={<ModifyEquipment />} />
                <Route path="/modify-config/:id" element={<ModifyConfig />} />
                <Route path="//modify-user/:id" element={<ModifyUser />} />
                <Route path="/intervention" element={<Intervention />} />
                <Route path="/liste" element={<Listes />} />
                <Route path="/listes" element={<Listes />} />
                <Route path="/listes/:id" element={<InterventionDetails />} />
                <Route path="/equip/:id" element={<Listes />} />
                <Route path="/alert/:equipmentId" element={<Alert />} />
                <Route path="/invoices/:equipmentId" element={<Invoices/>} />
                <Route path="/config" element={<Config/>} />
                <Route path="/alert"element={<Alert/>}/>
                <Route path="/pie/:equipmentId" element={<Pie />} />
                <Route path="/user" element={<User/>} />
                <Route path="/forgot" element={ <ResetPasswordForm/>} />
                <Route path="/topologi" element={<Topologi />} />
                <Route path="/password" element={ <ForgotPasswordForm/>} />
                </Routes>
           </main>
 
         </div>
         </SnackbarProvider>
 
       </ThemeProvider>
     </ColorModeContext.Provider>
   );
 }
 
 
 export default App;