import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import CustomCaptcha from '../components/CustomCaptcha' // Import the custom captcha

const Login = () => {
  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('') // For backend compatibility

  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)

  // Generate a simple token for custom captcha
  const generateCustomToken = () => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `custom_captcha_${timestamp}_${randomString}`;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validate custom captcha
    if (!captchaVerified) {
      toast.error('Please complete the security verification');
      return;
    }

    try {
      const requestData = {
        name,
        email,
        password,
        recaptchaToken: captchaToken || generateCustomToken() // Use custom token
      };

      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', requestData);

        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          toast.success('Account created successfully!');
        } else {
          toast.error(data.message);
          resetCaptcha();
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', {
          email,
          password,
          recaptchaToken: captchaToken || generateCustomToken()
        });

        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          toast.success('Logged in successfully!');
        } else {
          toast.error(data.message);
          resetCaptcha();
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
      resetCaptcha();
    }
  }

  const resetCaptcha = () => {
    setCaptchaVerified(false);
    setCaptchaToken('');
  }

  const handleCaptchaVerify = (token) => {
    setCaptchaVerified(true);
    setCaptchaToken(token);
    console.log('Custom captcha verified successfully');
  }

  const handleCaptchaError = (error) => {
    console.warn('Captcha error:', error);
    toast.warning(error || 'Please try the security verification again');
    setCaptchaVerified(false);
    setCaptchaToken('');
  }

  // Navigate to home if already logged in
  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  // Reset captcha when switching between login/signup
  useEffect(() => {
    resetCaptcha();
  }, [state]);

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>
        
        {state === 'Sign Up' && (
          <div className='w-full'>
            <p>Full Name</p>
            <input 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              className='border border-[#DADADA] rounded w-full p-2 mt-1' 
              type="text" 
              required 
            />
          </div>
        )}
        
        <div className='w-full'>
          <p>Email</p>
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1' 
            type="email" 
            required 
          />
        </div>
        
        <div className='w-full'>
          <p>Password</p>
          <input 
            onChange={(e) => setPassword(e.target.value)} 
            value={password} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1' 
            type="password" 
            required 
          />
        </div>
        
        {/* Custom Captcha Component */}
        <div className="w-full my-4">
          <CustomCaptcha
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
            disabled={!email || !password || (state === 'Sign Up' && !name)}
          />
        </div>
        
        <button 
          type="submit"
          className={`w-full py-2 my-2 rounded-md text-base transition-colors ${
            !captchaVerified || !email || !password || (state === 'Sign Up' && !name)
              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
          disabled={!captchaVerified || !email || !password || (state === 'Sign Up' && !name)}
        >
          {!captchaVerified 
            ? 'Please complete security verification' 
            : state === 'Sign Up' 
              ? 'Create account' 
              : 'Login'
          }
        </button>
        
        {state === 'Sign Up' ? (
          <p>
            Already have an account? {' '}
            <span 
              onClick={() => setState('Login')} 
              className='text-primary underline cursor-pointer hover:no-underline'
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account? {' '}
            <span 
              onClick={() => setState('Sign Up')} 
              className='text-primary underline cursor-pointer hover:no-underline'
            >
              Click here
            </span>
          </p>
        )}
        
        {/* Development Notice */}
        <div className="w-full mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <div className="font-semibold mb-1">Development Mode</div>
          <div>Using custom captcha for development. This includes:</div>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Math problems (e.g., 5 + 3 = ?)</li>
            <li>Pattern recognition (e.g., sequences)</li>
            <li>Color identification tasks</li>
          </ul>
        </div>
      </div>
    </form>
  )
}

export default Login