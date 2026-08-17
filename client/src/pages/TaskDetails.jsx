import clsx from "clsx";
import moment from "moment";
import React, { useState } from "react";
import { FaBug, FaTasks, FaThumbsUp, FaUser, FaFilePdf, FaExternalLinkAlt } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Tabs from "../components/Tabs";
import { PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import Loading from "../components/Loader";
import Button from "../components/Button";

// RTK Query Hooks
import {
  useGetTaskDetailQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/apiSlice";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Task Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TASKTYPEICON = {
  commented: (
    <div className='w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white'>
      <MdOutlineMessage />
    </div>
  ),
  started: (
    <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white'>
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className='w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white'>
      <FaUser size={14} />
    </div>
  ),
  bug: (
    <div className='text-red-600'>
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className='w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white'>
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className='w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white'>
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

// Helper function to check if asset URL is a PDF
const checkIsPdf = (url) => {
  if (!url || typeof url !== "string") return false;
  return url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("/raw/upload/");
};

const TaskDetails = () => {
  const { id } = useParams();
  const [selected, setSelected] = useState(0);

  // DB Data Fetching
  const { data, isLoading, error } = useGetTaskDetailQuery(id);
  const task = data?.task;

  if (isLoading) {
    return (
      <div className='py-10 flex justify-center items-center'>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-10 text-center text-red-500 font-semibold'>
        {error?.data?.message || "Failed to load task details"}
      </div>
    );
  }

  return (
    <div className='w-full flex flex-col gap-3 mb-4 overflow-y-hidden'>
      <h1 className='text-2xl text-gray-600 font-bold'>{task?.title}</h1>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {selected === 0 ? (
          <>
            <div className='w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow-md p-8 overflow-y-auto'>
              {/* LEFT */}
              <div className='w-full md:w-1/2 space-y-8'>
                <div className='flex items-center gap-5'>
                  <div
                    className={clsx(
                      "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                      PRIOTITYSTYELS[task?.priority],
                      bgColor[task?.priority]
                    )}
                  >
                    <span className='text-lg'>{ICONS[task?.priority]}</span>
                    <span className='uppercase'>{task?.priority} Priority</span>
                  </div>

                  <div className={clsx("flex items-center gap-2")}>
                    <div
                      className={clsx(
                        "w-4 h-4 rounded-full",
                        TASK_TYPE[task?.stage]
                      )}
                    />
                    <span className='text-black uppercase'>{task?.stage}</span>
                  </div>
                </div>

                <p className='text-gray-500'>
                  Created At: {new Date(task?.createdAt || task?.date).toDateString()}
                </p>

                <div className='flex items-center gap-8 p-4 border-y border-gray-200'>
                  <div className='space-x-2'>
                    <span className='font-semibold'>Assets :</span>
                    <span>{task?.assets?.length || 0}</span>
                  </div>

                  <span className='text-gray-400'>|</span>

                  <div className='space-x-2'>
                    <span className='font-semibold'>Sub-Task :</span>
                    <span>{task?.subTasks?.length || 0}</span>
                  </div>
                </div>

                <div className='space-y-4 py-6'>
                  <p className='text-gray-600 font-semibold text-sm'>
                    TASK TEAM
                  </p>
                  <div className='space-y-3'>
                    {task?.team?.map((m, index) => (
                      <div
                        key={m?._id || index}
                        className='flex gap-4 py-2 items-center border-t border-gray-200'
                      >
                        <div className='w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600'>
                          <span className='text-center'>
                            {getInitials(m?.name)}
                          </span>
                        </div>

                        <div>
                          <p className='text-lg font-semibold'>{m?.name}</p>
                          <span className='text-gray-500'>{m?.title || m?.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='space-y-4 py-6'>
                  <p className='text-gray-500 font-semibold text-sm'>
                    SUB-TASKS
                  </p>
                  <div className='space-y-8'>
                    {task?.subTasks?.map((el, index) => (
                      <div key={el?._id || index} className='flex gap-3'>
                        <div className='w-10 h-10 flex items-center justify-center rounded-full bg-violet-50'>
                          <MdTaskAlt className='text-violet-600' size={26} />
                        </div>

                        <div className='space-y-1'>
                          <div className='flex gap-2 items-center'>
                            <span className='text-sm text-gray-500'>
                              {new Date(el?.date).toDateString()}
                            </span>

                            <span className='px-2 py-0.5 text-center text-sm rounded-full bg-violet-100 text-violet-700 font-semibold'>
                              {el?.tag}
                            </span>
                          </div>

                          <p className='text-gray-700'>{el?.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: ASSETS & PDF SECTION */}
              <div className='w-full md:w-1/2 space-y-8'>
                <p className='text-lg font-semibold'>ASSETS ({task?.assets?.length || 0})</p>

                {task?.assets && task?.assets?.length > 0 ? (
                  <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {task?.assets?.map((el, index) => {
                      const isPdf = checkIsPdf(el);

                      return isPdf ? (
                        /* PDF File Card */
                        <div
                          key={index}
                          className='flex flex-col justify-between p-4 border border-red-200 bg-red-50 rounded-lg hover:shadow-md transition-all'
                        >
                          <div className='flex items-center gap-3'>
                            <FaFilePdf className='text-red-500 text-3xl flex-shrink-0' />
                            <div className='truncate'>
                              <p className='text-sm font-semibold text-gray-800 truncate'>
                                Document_{index + 1}.pdf
                              </p>
                              <span className='text-xs text-red-600 font-medium'>
                                PDF File
                              </span>
                            </div>
                          </div>

                          <a
                            href={el}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='mt-3 inline-flex items-center justify-center gap-2 w-full py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition'
                          >
                            <span>Open / View PDF</span>
                            <FaExternalLinkAlt size={11} />
                          </a>
                        </div>
                      ) : (
                        /* Image File Preview */
                        <div key={index} className='relative group overflow-hidden rounded-lg border border-gray-200'>
                          <img
                            src={el}
                            alt={task?.title}
                            className='w-full h-28 md:h-36 2xl:h-52 object-cover cursor-pointer transition-all duration-500 group-hover:scale-105'
                          />
                          <a
                            href={el}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity'
                          >
                            View Full Image
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className='text-sm text-gray-500 italic'>No assets uploaded for this task.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <Activities activity={task?.activities} id={id} />
        )}
      </Tabs>
    </div>
  );
};

const Activities = ({ activity, id }) => {
  const [selected, setSelected] = useState(act_types[0]);
  const [text, setText] = useState("");

  const [postActivity, { isLoading }] = usePostTaskActivityMutation();

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Please enter activity text");
      return;
    }
    try {
      const res = await postActivity({
        id,
        data: { type: selected.toLowerCase(), activity: text },
      }).unwrap();

      toast.success(res?.message || "Activity added successfully");
      setText("");
    } catch (err) {
      toast.error(err?.data?.message || err?.error || "Failed to add activity");
    }
  };

  const Card = ({ item }) => {
    return (
      <div className='flex space-x-4'>
        <div className='flex flex-col items-center flex-shrink-0'>
          <div className='w-10 h-10 flex items-center justify-center'>
            {TASKTYPEICON[item?.type?.toLowerCase()]}
          </div>
          <div className='w-full flex items-center h-full'>
            <div className='w-0.5 bg-gray-300 h-full mx-auto'></div>
          </div>
        </div>

        <div className='flex flex-col gap-y-1 mb-8'>
          <p className='font-semibold'>{item?.by?.name || "User"}</p>
          <div className='text-gray-500 space-x-2'>
            <span className='capitalize font-medium'>{item?.type}</span>
            <span className='text-sm'>{moment(item?.date).fromNow()}</span>
          </div>
          <div className='text-gray-700'>{item?.activity}</div>
        </div>
      </div>
    );
  };

  return (
    <div className='w-full flex flex-col md:flex-row gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto'>
      {/* Activity Timeline */}
      <div className='w-full md:w-1/2'>
        <h4 className='text-gray-600 font-semibold text-lg mb-5'>Activities</h4>

        <div className='w-full'>
          {activity?.map((el, index) => (
            <Card key={el?._id || index} item={el} />
          ))}
        </div>
      </div>

      {/* Add Activity Form */}
      <div className='w-full md:w-1/3 space-y-4'>
        <h4 className='text-gray-600 font-semibold text-lg mb-5'>
          Add Activity
        </h4>

        <div className='w-full flex flex-wrap gap-5'>
          {act_types.map((item) => (
            <div
              key={item}
              className='flex gap-2 items-center cursor-pointer'
              onClick={() => setSelected(item)}
            >
              <input
                type='checkbox'
                className='w-4 h-4 cursor-pointer'
                checked={selected === item}
                onChange={() => setSelected(item)}
              />
              <span className='text-gray-700 text-sm'>{item}</span>
            </div>
          ))}
        </div>

        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Type activity comment or notes here...'
          className='bg-white w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 text-gray-900 outline-none'
        />

        {isLoading ? (
          <Loading />
        ) : (
          <Button
            type='button'
            label='Submit Activity'
            onClick={handleSubmit}
            className='bg-blue-600 text-white rounded px-5 py-2'
          />
        )}
      </div>
    </div>
  );
};

export default TaskDetails;