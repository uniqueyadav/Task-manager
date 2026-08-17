import React, { useState } from "react";
import {
  MdOutlineRestore,
  MdDelete,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import Title from "../components/Title";
import Loading from "../components/Loader";
import ConfirmationDialog from "../components/Dialogs";
import {
  useGetTasksQuery,
  useDeleteRestoreTaskMutation,
} from "../redux/slices/apiSlice";
import { toast } from "sonner";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Trash = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState("restore");
  const [selectedId, setSelectedId] = useState("");

  const { data, isLoading, refetch } = useGetTasksQuery({
    stage: "",
    isTrashed: true,
  });

  const [deleteRestoreTask, { isLoading: isOperating }] = useDeleteRestoreTaskMutation();

  const deleteRestoreHandler = async () => {
    try {
      let result;
      
      // Call mutation with selectedId and type
      result = await deleteRestoreTask({
        id: selectedId,
        actionType: type,
      }).unwrap();

      toast.success(result?.message || "Operation successful");
      setOpenDialog(false);
      setSelectedId("");
      
      // Forcefully refetch fresh data
      await refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.error || "Something went wrong");
    }
  };

  const restoreAllClick = () => {
    setType("restoreAll");
    setSelectedId("");
    setMsg("Do you want to restore all items?");
    setOpenDialog(true);
  };

  const deleteAllClick = () => {
    setType("deleteAll");
    setSelectedId("");
    setMsg("Do you want to permanently delete all items?");
    setOpenDialog(true);
  };

  const restoreClick = (id) => {
    setSelectedId(id);
    setType("restore");
    setMsg("Do you want to restore the selected item?");
    setOpenDialog(true);
  };

  const deleteClick = (id) => {
    setSelectedId(id);
    setType("delete");
    setMsg("Do you want to permanently delete the selected item?");
    setOpenDialog(true);
  };

  if (isLoading)
    return (
      <div className='py-10 flex justify-center items-center'>
        <Loading />
      </div>
    );

  return (
    <>
      <div className='w-full md:px-1 px-0 mb-6'>
        <div className='flex items-center justify-between mb-8'>
          <Title title='Trashed Tasks' />

          {data?.tasks?.length > 0 && (
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
                  <th className='py-2'>Task Title</th>
                  <th className='py-2'>Priority</th>
                  <th className='py-2'>Stage</th>
                  <th className='py-2 line-clamp-1'>Modified On</th>
                  <th className='py-2 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.tasks?.map((item, id) => (
                  <tr
                    key={item._id || id}
                    className='border-b border-gray-200 text-gray-600 hover:bg-gray-400/10'
                  >
                    <td className='py-2'>
                      <div className='flex items-center gap-2'>
                        <p className='w-full line-clamp-2 text-base text-black'>
                          {item?.title}
                        </p>
                      </div>
                    </td>

                    <td className='py-2 capitalize'>
                      <div className='flex gap-1 items-center'>
                        <span className='text-lg'>{ICONS[item?.priority]}</span>
                        <span>{item?.priority}</span>
                      </div>
                    </td>

                    <td className='py-2 capitalize text-center md:text-start'>
                      <span className='inline-block text-sm font-semibold py-1 px-2.5 rounded-full bg-blue-100 text-blue-800'>
                        {item?.stage}
                      </span>
                    </td>

                    <td className='py-2 text-sm'>
                      {new Date(item?.date).toDateString()}
                    </td>

                    <td className='py-2 flex gap-2 justify-end'>
                      <button
                        onClick={() => restoreClick(item._id)}
                        className='text-blue-600 hover:text-[#0042da]'
                      >
                        <MdOutlineRestore className='text-xl' />
                      </button>
                      <button
                        onClick={() => deleteClick(item._id)}
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
        // Agar Dialog component me onClickHandler prop expected ho to target check karein:
        onClickHandler={deleteRestoreHandler}
      />
    </>
  );
};

export default Trash;