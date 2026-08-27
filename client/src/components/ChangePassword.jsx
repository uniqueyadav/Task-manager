import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useChangePasswordMutation } from "../redux/slices/apiSlice";
import Button from "./Button";
import Loading from "./Loader";
import ModalWrapper from "./ModalWrapper";
import Textbox from "./Textbox";

const ChangePassword = ({ open, setOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleFormSubmit = async (data) => {
    if (data.password !== data.cpass) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await changePassword({ password: data.password }).unwrap();
      toast.success(res?.message || "Password changed successfully");
      reset();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error || "Failed to change password");
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className='w-full'>
        <Dialog.Title as='h2' className='text-base font-bold leading-6 text-gray-900 mb-4'>
          Change Password
        </Dialog.Title>

        <div className='mt-2 flex flex-col gap-6'>
          <Textbox
            placeholder='New Password'
            type='password'
            name='password'
            label='New Password'
            className='w-full rounded'
            register={register("password", {
              required: "New Password is required!",
            })}
            error={errors.password ? errors.password.message : ""}
          />

          <Textbox
            placeholder='Confirm New Password'
            type='password'
            name='cpass'
            label='Confirm New Password'
            className='w-full rounded'
            register={register("cpass", {
              required: "Confirm Password is required!",
            })}
            error={errors.cpass ? errors.cpass.message : ""}
          />
        </div>

        {isLoading ? (
          <div className='py-5'>
            <Loading />
          </div>
        ) : (
          <div className='py-3 mt-4 sm:flex sm:flex-row-reverse gap-4'>
            <Button
              type='submit'
              className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto'
              label='Save'
            />
            <Button
              type='button'
              className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto border'
              onClick={() => setOpen(false)}
              label='Cancel'
            />
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

export default ChangePassword;