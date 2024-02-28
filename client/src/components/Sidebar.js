import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTh, FaAdn, FaRegUser } from 'react-icons/fa';
import { MdLogout, MdManageAccounts } from 'react-icons/md';
import { VscFeedback } from 'react-icons/vsc';
import { AiOutlineQuestionCircle, AiOutlineUsergroupAdd } from 'react-icons/ai'
import { MdModelTraining } from 'react-icons/md'
import { TbReportAnalytics } from 'react-icons/tb'
import useAuth from '../hooks/useAuth';
import '../styles/Sidebar.css';
import logo from '../Assets/enfuse-logo.png';
import Swal from 'sweetalert2';

const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const [isOpen] = useState(true);
  const [toggle, setToggle] = useState(false)


  const { auth, setAuth } = useAuth();
  const logout = () => {
    setAuth({});
    navigate('/');
    Swal.fire({
      icon: 'success',
      title: 'You have been Logged out successfully',
      showConfirmButton: false,
      confirmButtonColor: '#00B4D2',
      timer: 2000,
    });

    console.log('Logged out');
  };

  const menuItem = [
    {
      path:'/register',
      name: "Add Employee",
      icon: <AiOutlineUsergroupAdd />,
    },
    {
      path: '/questionaire',
      name: 'Create Test',
      icon: <AiOutlineQuestionCircle />,
    },
    {
      path: '/admin',
      name: 'Assessment',
      icon: <FaAdn />,
    },
    {
      path: '/induction',
      name: 'Induction',
      icon: <VscFeedback />,
    },
    
    {
      path: '/training',
      name: 'Trainings',
      icon: <MdModelTraining />,
    },
    
    {
      path: '/feedbacks',
      name: 'Feedback',
      icon: <FaTh />,
    },
    
    {
      path: '/managers',
      name: 'Managers',
      icon: <MdManageAccounts />,
    },
    {
      path: '/reports',
      name: 'Reports',
      icon: <TbReportAnalytics />,
    },
    {
      path: '/employees',
      name: 'Employees',
      icon: <FaTh />,
    },
    {
      path: '/nominations',
      name: 'Nomination',
      icon: <FaRegUser />,
    },
    
    

  ];

  if (auth.role === 'Employee') {
    return <main>{children}</main>;
  }

  return (
    <div>
      <div className="container">
        {auth.role && (
          <div style={{ width: isOpen ? '150px' : '25px' }} className="sidebar">
            <div className="top-section">
              <img style={{ width: '80%' }} src={logo} alt="logo" />
              <br />
              <p style={{ fontWeight: 'bold' }}>
                Welcome
                <br />
                {auth.fullName}
                <br />

              </p>
            </div>

            {menuItem.map((item, index) => {
              if (auth.role === 'Admin') {
                return (
                  (item.name === 'Add Employee' || item.name === 'Assessment' ||
                    item.name === 'Reports' ||
                    item.name === 'Create Test' ||
                    item.name === 'Induction' ||
                    item.name === 'Trainings' ||
                    item.name === "Managers" ||
                    item.name === "Feedback") && (
                    <NavLink to={item.path} key={index} className="link" activeclassname="active">
                      <div className="icon">{item.icon}</div>
                      <div className="link-text nowrap">{item.name}</div>
                    </NavLink>
                  )
                );
              } else if (auth.role === "Manager") {
                return (
                  (item.name === "Employees" || item.name === "Nomination") &&
                  <NavLink to={item.path} key={index} className="link" activeclassname="active">
                    <div className='icon'>{item.icon}</div>
                    <div className='link-text'>{item.name}</div>
                  </NavLink>
                )
              } else {
                return null;
              }
            })}


            {auth.role && (
              <button className="icon-button" onClick={logout}>
                <span className="icon-container">
                  <MdLogout />
                </span>
                <span className="text">Logout</span>
              </button>
            )}
          </div>
        )}

        {toggle && auth.role ? <div className='mob_sidebar' style={{ width: '150px', border: '1px solid gray', borderRadius: '5px', backgroundColor: 'white', zIndex: '10', position: 'absolute', top: '10px', left: '0px', color: 'white' }}>
          <div>
            <i className="bi bi-x-square-fill" onClick={() => setToggle(!toggle)} style={{ fontSize: '25px' }}></i>
          </div>
          {menuItem.map((item, index) => {
            if (index !== 6)
              return <>
                <NavLink to={item.path} key={index} className="link" activeclassname="active">
                  <div className='icon'>{item.icon}</div>
                  <div onClick={() => setToggle(!toggle)} className='link-text'>{item.name}</div>
                </NavLink>
              </>
          })}
        </div> : auth.role && <div className='mob_sidebar' onClick={() => setToggle(!toggle)} style={{ fontSize: '35px', position: 'absolute', top: '0px', left: '10px', color: 'rgba(3, 4, 44, 0.87)', backgroundImage: "none" }}>
          <i className="bi bi-list"></i>
        </div>}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Sidebar;
