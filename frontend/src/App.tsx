import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegistrationPage from './Registration/RegistrationPage';
import DashboardPage from './BeneficiaryDashboard/DashboardPage';
import InterCasteMarriageForm from './BeneficiaryDashboard/Inter-Caste_Marriage/InterCasteMarriageApplication';
import AtrocityReliefForm from './BeneficiaryDashboard/ReliefForAtrocity/AtrocityReliefForm';

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/inter-caste-marriage" element={<InterCasteMarriageForm />} />
        <Route path="/atrocity-relief" element={<AtrocityReliefForm />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App