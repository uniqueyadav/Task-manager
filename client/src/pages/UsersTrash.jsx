import React, { useState } from "react";
import { MdOutlineRestore, MdDelete } from "react-icons/md";
import Title from "../components/Title";
import Loading from "../components/Loader";
import ConfirmationDialog from "../components/Dialogs";
import {
  useGetTeamListQuery,
  useDeleteRestoreUserMutation,
} from "../redux/slices/apiSlice";
import { toast } from "sonner";
import { getInitials } from "../utils";

const UsersTrash = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState("restore");
  const [selectedId, setSelectedId] = useState("");

  const { data, isLoading, refetch } = useGetTeamListQuery({
    isTrashed: true,
  });

  const [deleteRestoreUser] = useDeleteRestoreUserMutation();

  const deleteRestoreHandler = async () => {
    try {
      const result = await deleteRestoreUser({
        id: selectedId,
        actionType: type,
      }).unwrap();

      toast.success(result?.message || "Operation successful");
      setOpenDialog(false);
      setSelectedId("");
      await refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.error || "Something went wrong");
    }
  };

  const restoreAllClick = () => {
    setType("restoreAll");
    setSelectedId("");
    setMsg("Do you want to restore all users?");
    setOpenDialog(true);
  };

  const deleteAllClick = () => {
    setType("deleteAll");
    setSelectedId("");
    setMsg("Do you want to permanently delete all users?");
    setOpenDialog(true);
  };

  const restoreClick = (id) => {
    setSelectedId(id);
    setType("restore");
    setMsg("Do you want to restore the selected user?");
    setOpenDialog(true);
  };

  const deleteClick = (id) => {
    setSelectedId(id);
    setType("delete");
    setMsg("Do you want to permanently delete the selected user?");
    setOpenDialog(true);
  };

  if (isLoading)
    return (
      <div className='py-10 flex justify-center items-center'>
        <Loading />
      </div>
    );

  const usersList = Array.isArray(data) ? data : data?.users || [];

  return (
    <>
      <div className='w-full md:px-1 px-0 mb-6'>
        <div className='flex items-center justify-between mb-8'>
          <Title title='Trashed Users' />

          {usersList?.length > 0 && (
            <div className='flex gap-2 md:gap-4 items-center'>
              <button
                onClick={restoreAllClick}
                className='flex flex-row-reverse gap-1 items-center font-semibold text-black text-sm md:text-base rounded-md 2xl:py-2.5'
              >
                <span>Restore All</span>
                <MdOutlineRestore className='text-lg' />
              </button>
              <button
                onClick={deleteAllClick}
                className='flex flex-row-reverse gap-1 items-center font-semibold text-red-600 text-sm md:text-base rounded-md 2xl:py-2.5'
              >
                <span>Delete All</span>
                <MdDelete className='text-lg' />
              </button>
            </div>
          )}
        </div>

        <div className='bg-white px-2 md:px-6 py-4 shadow-md rounded'>
          <div className='overflow-x-auto'>
            <table className='w-full mb-5'>
              <thead className='border-b border-gray-300'>
                <tr className='text-black text-left'>
                  <th className='py-2'>Full Name</th>
                  <th className='py-2'>Title</th>
                  <th className='py-2'>Email</th>
                  <th className='py-2'>Role</th>
                  <th className='py-2 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList?.map((user, id) => (
                  <tr
                    key={user._id || id}
                    className='border-b border-gray-200 text-gray-600 hover:bg-gray-400/10'
                  >
                    <td className='py-2'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold bg-blue-600'>
                          <span className='text-center text-sm'>
                            {getInitials(user?.name)}
                          </span>
                        </div>
                        <p className='text-base text-black font-medium'>
                          {user?.name}
                        </p>
                      </div>
                    </td>

                    <td className='py-2 text-sm'>
                      {user?.title || "N/A"}
                    </td>

                    <td className='py-2 text-sm'>
                      {user?.email || "N/A"}
                    </td>

                    <td className='py-2 capitalize text-sm'>
                      <span className='inline-block font-semibold py-1 px-2.5 rounded-full bg-blue-100 text-blue-800 text-xs'>
                        {user?.role || "User"}
                      </span>
                    </td>

                    <td className='py-2 flex gap-2 justify-end'>
                      <button
                        onClick={() => restoreClick(user._id)}
                        className='text-blue-600 hover:text-[#0042da]'
                      >
                        <MdOutlineRestore className='text-xl' />
                      </button>
                      <button
                        onClick={() => deleteClick(user._id)}
                        className='text-red-600 hover:text-red-900'
                      >
                        <MdDelete className='text-xl' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        msg={msg}
        onClick={deleteRestoreHandler}
        type={type}
        onClickHandler={deleteRestoreHandler}
      />
    </>
  );
};

export default UsersTrash;