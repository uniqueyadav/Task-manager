import React, { useState } from "react";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../utils";
import clsx from "clsx";
import ConfirmatioDialog, { UserAction } from "../components/Dialogs";
import AddUser from "../components/AddUser";
import {
  useGetTeamListQuery,
  useDeleteUserMutation,
  useUserActionMutation,
} from "../redux/slices/apiSlice";
import Loading from "../components/Loader";

const Users = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedActionUser, setSelectedActionUser] = useState(null);

  // 🔄 Active Users Fetching (isTrashed: false)
  const { data: teamData, isLoading, refetch } = useGetTeamListQuery({ isTrashed: false });
  const [deleteUser] = useDeleteUserMutation();
  const [userAction] = useUserActionMutation();

  // 🗑️ User Soft Delete Handler (Moved to Trash)
  const deleteHandler = async () => {
    try {
      if (selectedUserId) {
        await deleteUser(selectedUserId).unwrap();
        setOpenDialog(false);
        setSelectedUserId(null);
        refetch();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const userActionHandler = async () => {
    try {
      if (selectedActionUser?._id) {
        await userAction(selectedActionUser._id).unwrap();
        setOpenAction(false);
        setSelectedActionUser(null);
        refetch();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const userStatusClick = (el) => {
    setSelectedActionUser(el);
    setOpenAction(true);
  };

  const deleteClick = (id) => {
    setSelectedUserId(id);
    setOpenDialog(true);
  };

  const editClick = (el) => {
    setSelectedUser(el);
    setOpen(true);
  };

  const TableHeader = () => (
    <thead className='border-b border-gray-300'>
      <tr className='text-black text-left'>
        <th className='py-2'>Full Name</th>
        <th className='py-2'>Title</th>
        <th className='py-2'>Email</th>
        <th className='py-2'>Role</th>
        <th className='py-2'>Active</th>
        <th className='py-2 text-right'>Actions</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-400/10'>
      <td className='p-2'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700'>
            <span className='text-xs md:text-sm text-center'>
              {getInitials(user?.name)}
            </span>
          </div>
          {user?.name}
        </div>
      </td>

      <td className='p-2'>{user?.title}</td>
      <td className='p-2'>{user?.email}</td>
      <td className='p-2'>{user?.role}</td>

      <td>
        <button
          onClick={() => userStatusClick(user)}
          className={clsx(
            "w-fit px-4 py-1 rounded-full text-xs font-semibold",
            user?.isActive ? "bg-blue-200 text-blue-800" : "bg-yellow-100 text-yellow-800"
          )}
        >
          {user?.isActive ? "Active" : "Disabled"}
        </button>
      </td>

      <td className='p-2 flex gap-4 justify-end'>
        <Button
          className='text-blue-600 hover:text-blue-500 font-semibold sm:px-0'
          label='Edit'
          type='button'
          onClick={() => editClick(user)}
        />

        <Button
          className='text-red-700 hover:text-red-500 font-semibold sm:px-0'
          label='Delete'
          type='button'
          onClick={() => deleteClick(user?._id)}
        />
      </td>
    </tr>
  );

  return isLoading ? (
    <div className='py-10'>
      <Loading />
    </div>
  ) : (
    <>
      <div className='w-full md:px-1 px-0 mb-6'>
        <div className='flex items-center justify-between mb-8'>
          <Title title='Team Members' />
          <Button
            label='Add New User'
            icon={<IoMdAdd className='text-lg' />}
            className='flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5 px-3 py-2'
            onClick={() => {
              setSelectedUser(null);
              setOpen(true);
            }}
          />
        </div>

        <div className='bg-white px-2 md:px-4 py-4 shadow-md rounded'>
          <div className='overflow-x-auto'>
            <table className='w-full mb-5'>
              <TableHeader />
              <tbody>
                {teamData?.map((user, index) => (
                  <TableRow key={user?._id || index} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selectedUser}
        key={selectedUser ? selectedUser._id : "new-user"}
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />
    </>
  );
};

export default Users;