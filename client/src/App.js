import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import Sidebar from './components/Sidebar';
import RequireAuth from './components/RequireAuth';
import { AuthProvider } from './context/AuthProvider';
import Home from './pages/Home.js';
import Reports from './pages/Reports.js';
import './App.css'
import { FadeLoader } from "react-spinners";
import QuestionList from './components/QuestionList';
import Exam from './pages/Exam';
import Questionaire from './pages/Questionaire';
import Admin from './pages/Admin';
import FeedbackForm from './pages/FeedbackForm';
import View from './pages/View';
import Edit from './pages/Edit';
import Induction from './pages/Induction';
import Registration from './components/Registration';
import QuestionForm from './components/QuestionForm';
import Training from './pages/Trainings';
import Managers from './pages/Managers';
import Feedback from './pages/Feedback';
import Nominations from './pages/Nominations';
import Employees from './pages/Employees';
import ViewNomination from './components/ViewNomination'
import Calendar from './components/Calender';
import EditNomination from './components/EditNomination';



const App = () => {
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(true);
    }, 3000); 
      
  }, []);

  if (!isLoading) {
    return <div style={{ textAlign: 'center', margin: '200px auto' }}>
    <center><FadeLoader color={'#00B4D2'} size={20} /></center>
    <div>Please wait a moment</div>
  </div>
  }
  return (
    <BrowserRouter>
      <AuthProvider>
      <Sidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<RequireAuth />} >
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/nominations" element={<Nominations />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/feedbacks" element={<Feedback />} />
          <Route path='/register' element={<Registration />} />
           <Route path='/admin' element={<Admin />} />
           <Route path='/induction' element={<Induction />} />
           <Route path='/training' element={<Training />} />
           <Route path='/managers' element={<Managers />} /> 
           <Route path="/reports" element={<Reports />} />
            <Route path='/questionaire' element={<Questionaire />} />
            <Route path='/questions/all' element={<QuestionList />} />
            <Route path='/exam' element={<Exam />} />
            <Route path='/hr/view/:id' element={<View />}/>
            <Route path='/hr/edit/:id' element={<Edit />}/>
            <Route path='/edit/:email' element={<EditNomination />} />
            <Route path='/view/:email' element={<ViewNomination />} />
            <Route path='/question/edit/:id' element={<QuestionForm />} />
          </Route>
        </Routes>
      </Sidebar>
        </AuthProvider>
    </BrowserRouter>
  );
};

export default App