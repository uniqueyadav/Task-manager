import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import { MdCheck } from "react-icons/md";
import { useGetTeamListQuery } from "../../redux/slices/apiSlice";

const UserList = ({ setTeam, team }) => {
  const { data, isLoading, error } = useGetTeamListQuery();

  const teamUsers = Array.isArray(data)
    ? data
    : data?.users || data?.team || [];

  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (teamUsers.length > 0) {
      if (!team || team.length === 0) {
        setSelectedUsers([]);
      } else {
        const selected = teamUsers.filter((u) =>
          team.some((t) => (typeof t === "object" ? t._id === u._id : t === u._id))
        );
        setSelectedUsers(selected);
      }
    }
  }, [data, team]);

  const handleChange = (el) => {
    setSelectedUsers(el);
    setTeam(el);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <p className="text-gray-700 mb-1 text-sm font-medium">Assign Task To:</p>
        <div className="p-2 border rounded bg-gray-50 text-xs text-gray-500">
          Loading users from database...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <p className="text-gray-700 mb-1 text-sm font-medium">Assign Task To:</p>
        <div className="p-2 border border-red-200 rounded bg-red-50 text-xs text-red-500">
          Failed to fetch users from database.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-gray-700 mb-1 text-sm font-medium">Assign Task To:</p>
      <Listbox value={selectedUsers} onChange={handleChange} multiple>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded bg-white pl-3 pr-10 text-left px-3 py-2.5 border border-gray-300 sm:text-sm">
            {/* Jab length 0 hogi toh "Please select a user" dikhega */}
            <span
              className={`block truncate ${
                selectedUsers?.length === 0 ? "text-red-500 font-medium" : "text-gray-900"
              }`}
            >
              {selectedUsers?.length > 0
                ? selectedUsers.map((u) => u.name).join(", ")
                : "Please select a user"}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <BsChevronExpand className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {teamUsers.length === 0 ? (
                <div className="px-4 py-2 text-xs text-gray-500">
                  No users found in Database.
                </div>
              ) : (
                teamUsers.map((user) => (
                  <Listbox.Option
                    key={user._id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                      }`
                    }
                    value={user}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {user.name} ({user.title || user.role || "User"})
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            <MdCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      
      {/* Dynamic inline warning text below dropdown */}
      {selectedUsers?.length === 0 && (
        <span className="text-xs text-red-500 mt-1 block font-medium">
          Please select at least one user to assign task.
        </span>
      )}
    </div>
  );
};

export default UserList;