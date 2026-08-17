import React, { useState, useEffect } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import { BiPaperclip } from "react-icons/bi";
import Button from "../Button";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/apiSlice";

// Firebase setup imports (agar Firebase use kar rahe hain)
// import { getStorage, ref, uploadBytesResumption, getDownloadURL } from "firebase/storage";
// import { app } from "../../utils/firebase";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORITY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

const AddTask = ({ open, setOpen, task }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [team, setTeam] = useState([]);
  const [stage, setStage] = useState(LISTS[0]);
  const [priority, setPriority] = useState(PRIORITY[2]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedAssetUrl, setUploadedAssetUrl] = useState("");

  useEffect(() => {
    if (task) {
      reset({
        title: task.title || "",
        date: task.date
          ? new Date(task.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
      setTeam(task.team || []);
      setStage(task.stage?.toUpperCase() || LISTS[0]);
      setPriority(task.priority?.toUpperCase() || PRIORITY[2]);
      setUploadedAssetUrl(task.assets?.[0] || "");
    } else {
      reset({
        title: "",
        date: new Date().toISOString().split("T")[0],
      });
      setTeam([]);
      setStage(LISTS[0]);
      setPriority(PRIORITY[2]);
      setFile(null);
      setUploadedAssetUrl("");
    }
  }, [task, open, reset]);

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  // Helper function to handle cloud upload (e.g., Firebase Storage)
  const uploadFile = async (fileToUpload) => {
    /* 
    // Firebase Upload Example:
    const storage = getStorage(app);
    const fileName = new Date().getTime() + "_" + fileToUpload.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumption(storageRef, fileToUpload);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
    */

    // Returning placeholder or backend file path handler if uploading directly to express server
    return URL.createObjectURL(fileToUpload); 
  };

  const submitHandler = async (data) => {
    if (!team || team.length === 0) {
      alert("Please select at least one team member to assign the task!");
      return;
    }

    const teamIds = team.map((user) =>
      typeof user === "object" ? user._id : user
    );

    try {
      setUploading(true);
      let assetUrl = uploadedAssetUrl;

      // Agar new file select hui hai to perform upload
      if (file) {
        assetUrl = await uploadFile(file);
      }

      const taskData = {
        ...data,
        team: teamIds,
        stage,
        priority,
        assets: assetUrl ? [assetUrl] : [],
      };

      const res = task?._id
        ? await updateTask({ id: task._id, data: taskData }).unwrap()
        : await createTask(taskData).unwrap();

      alert(res?.message || "Task saved successfully!");
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert(err?.data?.message || err.message || "Something went wrong!");
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const isSubmitting = isCreating || isUpdating || uploading;

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Dialog.Title
          as='h2'
          className='text-base font-bold leading-6 text-gray-900 mb-4'
        >
          {task ? "UPDATE TASK" : "ADD TASK"}
        </Dialog.Title>

        <div className='mt-2 flex flex-col gap-6'>
          <Textbox
            placeholder='Task Title'
            type='text'
            name='title'
            label='Task Title'
            className='w-full rounded'
            register={register("title", { required: "Title is required" })}
            error={errors.title ? errors.title.message : ""}
          />

          <UserList setTeam={setTeam} team={team} />

          <div className='flex gap-4'>
            <SelectList
              label='Task Stage'
              lists={LISTS}
              selected={stage}
              setSelected={setStage}
            />

            <div className='w-full'>
              <Textbox
                placeholder='Date'
                type='date'
                name='date'
                label='Task Date'
                className='w-full rounded'
                register={register("date", {
                  required: "Date is required!",
                })}
                error={errors.date ? errors.date.message : ""}
              />
            </div>
          </div>

          <div className='flex gap-4 items-center'>
            <SelectList
              label='Priority Level'
              lists={PRIORITY}
              selected={priority}
              setSelected={setPriority}
            />

            <div className='w-full flex items-center justify-center mt-4'>
              <label
                className='flex items-center gap-2 text-base text-gray-600 hover:text-blue-600 cursor-pointer my-4 border border-dashed border-gray-300 p-2 rounded-md w-full justify-center'
                htmlFor='fileUpload'
              >
                <input
                  type='file'
                  className='hidden'
                  id='fileUpload'
                  onChange={handleSelect}
                  accept='.jpg, .jpeg, .png, .pdf, .doc, .docx'
                  multiple={false}
                />
                <BiPaperclip className='text-xl' />
                <span className='text-sm truncate max-w-[180px]'>
                  {file
                    ? file.name
                    : uploadedAssetUrl
                    ? "Change Attached Document"
                    : "Attach File (PDF, DOC, Image)"}
                </span>
              </label>
            </div>
          </div>

          <div className='bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4'>
            {isSubmitting ? (
              <span className='text-sm py-2 text-red-500 font-medium'>
                {uploading ? "Uploading File..." : "Saving Task..."}
              </span>
            ) : (
              <Button
                label='Submit'
                type='submit'
                className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto'
              />
            )}

            <Button
              type='button'
              className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
              onClick={() => setOpen(false)}
              label='Cancel'
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddTask;