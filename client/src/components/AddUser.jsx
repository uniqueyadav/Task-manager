import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import ModalWrapper from "./ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "./Textbox";
import Loading from "./Loader";
import Button from "./Button";
import {
  useAddNewUserMutation,
  useUpdateUserMutation,
} from "../redux/slices/apiSlice";

const AddUser = ({ open, setOpen, userData }) => {
  const [addNewUser, { isLoading: isAdding }] = useAddNewUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // 🔧 Safety Check: Ensure userData is a valid object and not a string/ID
  const validUserData =
    userData && typeof userData === "object" ? userData : null;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: validUserData ?? {
      name: "",
      title: "",
      email: "",
      role: "",
      password: "",
      cPassword: "",
    },
  });

  // 🔄 Sync modal form when updating an existing user profile
  useEffect(() => {
    if (open) {
      if (validUserData) {
        reset(validUserData);
      } else {
        reset({
          name: "",
          title: "",
          email: "",
          role: "",
          password: "",
          cPassword: "",
        });
      }
    }
  }, [validUserData, reset, open]);

  const password = watch("password");

  const handleOnSubmit = async (data) => {
    try {
      if (validUserData?._id) {
        await updateUser({ ...data, _id: validUserData._id }).unwrap();
      } else {
        await addNewUser(data).unwrap();
      }
      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error submitting user form:", error);
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Dialog.Title
          as='h2'
          className='text-base font-bold leading-6 text-gray-900 mb-4'
        >
          {validUserData ? "UPDATE PROFILE" : "ADD NEW USER"}
        </Dialog.Title>

        <div className='mt-2 flex flex-col gap-4'>
          <Textbox
            placeholder='Full name'
            type='text'
            name='name'
            label='Full Name'
            className='w-full rounded'
            register={register("name", {
              required: "Full name is required!",
            })}
            error={errors.name ? errors.name.message : ""}
          />
          <Textbox
            placeholder='Title'
            type='text'
            name='title'
            label='Title'
            className='w-full rounded'
            register={register("title", {
              required: "Title is required!",
            })}
            error={errors.title ? errors.title.message : ""}
          />
          <Textbox
            placeholder='Email Address'
            type='email'
            name='email'
            label='Email Address'
            className='w-full rounded'
            register={register("email", {
              required: "Email Address is required!",
            })}
            error={errors.email ? errors.email.message : ""}
          />
          <Textbox
            placeholder='Role'
            type='text'
            name='role'
            label='Role'
            className='w-full rounded'
            register={register("role", {
              required: "User role is required!",
            })}
            error={errors.role ? errors.role.message : ""}
          />

          <Textbox
            placeholder={
              validUserData
                ? "Leave blank to keep existing password"
                : "Password"
            }
            type='password'
            name='password'
            label='Password'
            className='w-full rounded'
            register={register("password", {
              required: validUserData ? false : "Password is required!",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={errors.password ? errors.password.message : ""}
          />

          {!validUserData && (
            <Textbox
              placeholder='Confirm Password'
              type='password'
              name='cPassword'
              label='Confirm Password'
              className='w-full rounded'
              register={register("cPassword", {
                required: "Confirm Password is required!",
                validate: (value) =>
                  value === password || "Passwords do not match!",
              })}
              error={errors.cPassword ? errors.cPassword.message : ""}
            />
          )}
        </div>

        {isAdding || isUpdating ? (
          <div className='py-5'>
            <Loading />
          </div>
        ) : (
          <div className='py-3 mt-4 sm:flex sm:flex-row-reverse'>
            <Button
              type='submit'
              className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto'
              label='Submit'
            />
            <Button
              type='button'
              className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
              onClick={() => setOpen(false)}
              label='Cancel'
            />
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

export default AddUser;