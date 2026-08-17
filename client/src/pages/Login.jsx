import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "../components/Button";
import Loader from "../components/Loader";
import Textbox from "../components/Textbox";
import { useLoginMutation, useRegisterMutation } from "../redux/slices/apiSlice";
import { setCredentials } from "../redux/slices/authSlice";

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const [isRegister, setIsRegister] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerApi, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const submitHandler = async (data) => {
    try {
      if (isRegister) {
        // Register API Call
        const res = await registerApi(data).unwrap();
        dispatch(setCredentials(res));
        toast.success("Account created successfully!");
        navigate("/dashboard");
      } else {
        // Login API Call
        const res = await login(data).unwrap();
        dispatch(setCredentials(res));
        toast.success("Login Successful!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.log("Error:", err);
      toast.error(err?.data?.message || err?.error || "Something went wrong!");
    }
  };

  useEffect(() => {
    user && navigate("/dashboard");
  }, [user, navigate]);

  const toggleAuthMode = () => {
    setIsRegister((prev) => !prev);
    reset(); // Clear all inputs
    clearErrors(); // Clear validation error messages
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        {/* Left Side */}
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base border-gray-300 text-gray-600'>
              Manage all your task in one place!
            </span>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700'>
              <span>Cloud-Based</span>
              <span>Task Manager</span>
            </p>

            <div className='cell'>
              <div className='circle rotate-in-up-left'></div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-5 bg-white px-10 pt-8 pb-8 shadow-md rounded-lg'
          >
            <div>
              <p className='text-blue-600 text-3xl font-bold text-center'>
                {isRegister ? "Create Account" : "Welcome back!"}
              </p>
              <p className='text-center text-sm text-gray-600 mt-1'>
                {isRegister
                  ? "Register to manage your tasks easily."
                  : "Keep all your credentials safe."}
              </p>
            </div>

            <div className='flex flex-col gap-y-4'>
              {/* Full Name (Register Mode Only) */}
              {isRegister && (
                <Textbox
                  placeholder='Full Name'
                  type='text'
                  name='name'
                  label='Full Name'
                  className='w-full rounded-full'
                  register={register("name", {
                    required: "Full Name is required!",
                  })}
                  error={errors.name ? errors.name.message : ""}
                />
              )}

              {/* Email */}
              <Textbox
                placeholder='email@example.com'
                type='email'
                name='email'
                label='Email Address'
                className='w-full rounded-full'
                register={register("email", {
                  required: "Email Address is required!",
                })}
                error={errors.email ? errors.email.message : ""}
              />

              {/* Password */}
              <Textbox
                placeholder='Your password'
                type='password'
                name='password'
                label='Password'
                className='w-full rounded-full'
                register={register("password", {
                  required: "Password is required!",
                })}
                error={errors.password ? errors.password.message : ""}
              />

              {/* Title & Role Fields (Register Mode Only) */}
             

              {!isRegister && (
                <span className='text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer text-right'>
                  Forget Password?
                </span>
              )}

              {isLoginLoading || isRegisterLoading ? (
                <Loader />
              ) : (
                <Button
                  type='submit'
                  label={isRegister ? "Register" : "Submit"}
                  className='w-full h-10 bg-blue-700 text-white rounded-full font-medium'
                />
              )}

              {/* Toggle Mode */}
              <div className='text-center text-sm text-gray-600 mt-2'>
                {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type='button'
                  onClick={toggleAuthMode}
                  className='text-blue-600 font-bold hover:underline cursor-pointer bg-transparent border-0'
                >
                  {isRegister ? "Login here" : "Register here"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;