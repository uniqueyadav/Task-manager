import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FaUser, FaUserLock } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getInitials } from "../utils";

// 1. Correct Import Path
import { useLogoutMutation } from "../redux/slices/apiSlice";
import { logout } from "../redux/slices/authSlice";

const UserAvatar = () => {
  const [open, setOpen] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // RTK Query Logout Hook
  const [logoutApi] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      // Step 1: Call Backend API to clear httpOnly cookie
      await logoutApi().unwrap();

      // Step 2: Clear Redux store state
      dispatch(logout());

      // Step 3: Clear LocalStorage explicitly
      localStorage.removeItem("userInfo");

      toast.success("Logged out successfully");

      // Step 4: Redirect to login page
      navigate("/log-in");
    } catch (err) {
      console.error("Logout Error:", err);
      
      // Fallback: Agar backend API fail ho bhi jaaye, local cleanup execute hoga
      dispatch(logout());
      localStorage.removeItem("userInfo");
      navigate("/log-in");
    }
  };

  return (
    <>
      <div>
        <Menu as='div' className='relative inline-block text-left'>
          <div>
            <Menu.Button className='w-10 h-10 2xl:w-12 2xl:h-12 flex items-center justify-center rounded-full bg-blue-600'>
              <span className='text-white font-semibold'>
                {getInitials(user?.name)}
              </span>
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none z-50'>
              <div className='p-2'>
                {/* Profile Item */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type='button'
                      onClick={() => setOpen(true)}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <FaUser className='mr-2' aria-hidden='true' />
                      Profile
                    </button>
                  )}
                </Menu.Item>

                {/* Change Password Item */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type='button'
                      onClick={() => setOpenPassword(true)}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <FaUserLock className='mr-2' aria-hidden='true' />
                      Change Password
                    </button>
                  )}
                </Menu.Item>

                {/* Logout Item */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type='button'
                      onClick={logoutHandler}
                      className={`${
                        active ? "bg-red-50" : ""
                      } text-red-600 group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium`}
                    >
                      <IoLogOutOutline className='mr-2 text-lg' aria-hidden='true' />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </>
  );
};

export default UserAvatar;