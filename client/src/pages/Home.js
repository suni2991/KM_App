import React, { useState } from 'react'
import '../styles/Login.css';
import useAuth from "../hooks/useAuth";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import login from '../Assets/Hire bg.jpg'
import Swal from 'sweetalert2';
import logo from '../Assets/LnD Logo2.png'


function Home() {
  let { auth } = useAuth();
  let { setAuth } = useAuth();

  let navigate = useNavigate();
  let location = useLocation();
  let from = location.state?.from?.pathname || "/";

  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");


  let onLogin = async () => {
    let credentials = {
      email,
      password,

    };
    let baseURL = "http://52.44.231.112:6001/api/login"

    axios.post(baseURL, credentials).then((response) => {

      if (response.status === 200) {
        console.log("response data is:", response.data)

        if (response.data.role === "Admin") {
          navigate("/training");
        } else if (response.data.role === "Manager") {
          navigate("/employees");
        } else if (response.data.role === "Employee") {
           if (response.data.category === "Induction"){
            navigate("/feedback");
           } else {
            navigate('/exam')
           }
          let authData = response.data;
           let selectedTopic = authData.topics[authData.topics.length - 1].topic; 
          console.log("Selected topic:", selectedTopic);
          setAuth(authData);
          

        }
      }
      else { console.warn("check the response") }
      setAuth(response.data)
      console.log("response:", response)
      
    })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 400) {
            Swal.fire({
              title: 'Error!',
              text: 'Enter Email and password',
              icon: 'error',
              showConfirmButton: true,
              confirmButtonColor: '#00B4D2',
            })
          } else if (error.response.status === 404) {
            Swal.fire({
              title: 'Access Denied!',
              text: 'Invalid Credentials / UnAuthorised Access!',
              icon: 'error',
              showConfirmButton: true,
              confirmButtonColor: '#00B4D2',
            })
          } 
          else if (error.response.status === 401) {
            Swal.fire({
              title:'Access Denied!',
              text: 'Invalid Credentials / UnAuthorised Access!',
              icon: 'error',
              showConfirmButton: true,
              confirmButtonColor: '#00B4D2',
            })}
          }

       
      });
    navigate(from, { replace: true });
  }


  return (
    <div>


      {auth.role ?
        <h1> Welcome to {auth.role} Dashboard</h1>
        : <div className='logincontainer'>
            <center>
                <div className='column2'>
                  <form>
                    <div className='form-container'>
                      <div className='column1'>
                          <img src={login} alt="login" />
                      </div>
                      <div className='column3'>
                      <img src={logo} alt="logo" />
                          <h1>User Login</h1>
                          <input type="text" className="login-field1"
                            placeholder="Username"
                            onChange={(e) => setEmail(e.target.value)} />
                          <input type="password" className="login-field1" placeholder="Password" onChange={(e) => { setPassword(e.target.value); }} onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onLogin();
                            }
                          }}/>
                          <div className='login-butt-cont'>
                              <button className="submit-button1" type="button" onClick={onLogin}>LOGIN</button>
                          </div>
                      </div>
                    </div>
                  </form >
                </div>
          </center>
        </div>}


    </div>
  )
}

export default Home
