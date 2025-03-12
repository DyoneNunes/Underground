import HomePage from './pages/Home';
import SabaJv from './pages/SabaMasTattoadores/SabaJv';
import SabaLion from './pages/SabaMasTattoadores/SabaLion';
import SabaMoretto from './pages/SabaMasTattoadores/SabaMoretto';
import SabaScheffer from './pages/SabaMasTattoadores/SabaScheffer';
import Events from './pages/Events/Events';

import GlobalStyles from './styles/global';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/JvTattoo" element={<SabaJv />} />
                <Route path="/Lion" element={<SabaLion />} />
                <Route path="/Moretto" element={<SabaMoretto />} />
                <Route path="/Scheffer" element={<SabaScheffer />} />
                <Route path="/Eventos" element={<Events />} />
            </Routes>
            <GlobalStyles />
        </Router>
    );
};

export default App;
