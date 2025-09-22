import { useForm } from 'react-hook-form';
import styles from './Auth.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = async (data) => {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', data, {
      withCredentials: true, // to send and receive cookies
    });


    if (response.status === 200) {
      alert('Login successful!');
      const {accessToken} =response.data;
      if(accessToken){
        localStorage.setItem("accessToken",accessToken)
      }else{
        console.log("Token Not Received");
        
      }
      // No localStorage usage anymore

      // Navigate to dashboard or protected route
      navigate('/userDetails'); // adjust the route as per your app
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      alert(error.response.data.message || 'Login failed');
    } else {
      alert('An unexpected error occurred. Please try again.');
    }
  }
};


  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
        <h2 className={styles.authTitle}>Login to your account</h2>

        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>Username</label>
          <input
            id="username"
            type="text"
            className={styles.input}
            {...register('username', {
              required: 'Username is required',
            })}
          />
          {errors.username && <div className={styles.error}>{errors.username.message}</div>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input
            id="password"
            type="password"
            className={styles.input}
            {...register('password', {
              required: 'Password is required',
            })}
          />
          {errors.password && <div className={styles.error}>{errors.password.message}</div>}
        </div>

        <button type="submit" className={styles.submitButton}>
          Login
        </button>

        {/* Registration removed */}
      </form>
    </div>
  );
};

export default Login;
