import React from "react";
import { MdOutlineSearch } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setOpenSidebar } from "../redux/slices/authSlice";
import UserAvatar from "./UserAvatar";
import NotificationPanel from "./NotificationPanel";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <div className='flex justify-between items-center bg-white px-4 py-3 2xl:py-4 sticky z-10 top-0 shadow-sm'>
      <div className='flex gap-4 items-center'>
        <button
          onClick={() => dispatch(setOpenSidebar(true))}
          className='text-2xl text-gray-500 block md:hidden'
        >
          ☰
        </button>

        <div className='w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-[#f3f4f6]'>
          <MdOutlineSearch className='text-gray-500 text-xl' />

          <input
            type='text'
            placeholder='Search....'
            className='flex-1 outline-none bg-transparent placeholder:text-gray-500 text-gray-800'
          />
        </div>
      </div>

      {/* Stylish Admin Panel Badge (Only visible when user is Admin) */}
      {user?.isAdmin && (
        <div className='hidden md:flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold text-lg tracking-wider uppercase shadow-md shadow-indigo-200 animate-pulse'>
          <span>Admin Panel</span>
        </div>
      )}

      <div className='flex gap-4 items-center'>
        {user?.name && (
          <span className='hidden sm:block text-sm font-medium text-gray-700'>
            Welcome, <span className='font-semibold text-blue-600'>{user.name}</span>
          </span>
        )}

        <NotificationPanel />

        <UserAvatar />
      </div>
    </div>
  );
};

export default Navbar;