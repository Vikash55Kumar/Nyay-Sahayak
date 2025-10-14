// import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
// import { useAuth } from './context/AuthContext';
// import { useAppDispatch } from './hooks/redux';

// Public Pages
import About from './pages/general/About';
import Contact from './pages/general/Contact';
import Help from './pages/general/Help';
import Footer from './layouts/Footer';
import DashboardPage from './pages/BeneficiaryDashboard/DashboardPage';
import RegistrationPage from './pages/auth/RegestrationPage';
import LoginPage from './pages/auth/LoginPage';
import Navbar from './layouts/Navbar';
import UserProfilePage from './pages/BeneficiaryDashboard/Profile';
import MarriageApplicationPage from './pages/BeneficiaryDashboard/MerriageApplication';
import AtrocityReliefApplicationPage from './pages/BeneficiaryDashboard/AtrocityRelifApplication';
import MyApplicationsPage from './pages/BeneficiaryDashboard/MyApplicationsPage';
import ApplicationTimelinePage from './pages/BeneficiaryDashboard/ApplicationTimelinePage';
import AuthorityReviewPage from './pages/BeneficiaryDashboard/AuthorityReviewPage';
import AuthorityDashboardPage from './pages/BeneficiaryDashboard/AuthorityDashboard';
import MarriageReviewPage from './pages/review/MarriageReviewPage';
import RegistrationReviewPage from './pages/review/RegistrationReview';
import LandingPage from './pages/home/Home';
import { useEffect } from 'react';
import { useAppDispatch } from './hooks/redux';
import { useAuth } from './context/AuthContext';
import { getCurrentUserAsync } from './store/slices/authSlice';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  console.log('user', user);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated) {
      dispatch(getCurrentUserAsync());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <ToastContainer 
        position="top-center"  // This will show the toast in the center of the screen
        autoClose={3000}  // Toast will disappear after 3 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        closeButton={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="">
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />
            <Route path="/profile" element={isAuthenticated ? <UserProfilePage /> : <LoginPage />} />
            <Route path="/active" element={<div>frontend active</div>} />
            <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/authority-dashboard' element={isAuthenticated ? <AuthorityDashboardPage /> : <LoginPage />} />
            <Route path='/application-timeline' element={isAuthenticated ? <ApplicationTimelinePage /> : <LoginPage />} />
            {/* Support direct links like /application/:applicationId from MyApplicationsPage */}
            <Route path='/application/:applicationId' element={isAuthenticated ? <ApplicationTimelinePage /> : <LoginPage />} />
            <Route path='/my-applications' element={isAuthenticated ? <MyApplicationsPage /> : <LoginPage />} />
            <Route path="/inter-caste-marriage" element={isAuthenticated ? <MarriageApplicationPage /> : <LoginPage />} />
            <Route path="/atrocity-relief" element={isAuthenticated ? <AtrocityReliefApplicationPage /> : <LoginPage />} />
            <Route path="/authority/review" element={isAuthenticated ? <AuthorityReviewPage /> : <LoginPage />} />
            <Route path="/authority/marriage-review" element={isAuthenticated ? <MarriageReviewPage /> : <LoginPage />} />
            <Route path="/authority/registration-review" element={isAuthenticated ? <RegistrationReviewPage /> : <LoginPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
