import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URI = "https://task-manager-ktt8.onrender.com/api";

const baseQuery = fetchBaseQuery({
    baseUrl: API_URI,
    //credentials: true, 
    credentials: "include",
});

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ["Task", "User", "Notice"],
    endpoints: (builder) => ({
        // Auth Endpoints
        login: builder.mutation({
            query: (data) => ({
                url: "/user/login",
                method: "POST",
                body: data,
            }),
        }),
        register: builder.mutation({
            query: (data) => ({
                url: "/user/register",
                method: "POST",
                body: data,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/user/logout",
                method: "POST",
            }),
        }),

        // User / Team Endpoints
        getTeamList: builder.query({
            query: (params = {}) => {
                const { isTrashed = false } = params;
                return {
                    url: `/user/get-team?isTrashed=${isTrashed}`,
                    method: "GET",
                };
            },
            providesTags: ["User"],
        }),
        getTrashedUsers: builder.query({
            query: () => ({
                url: "/user/get-team?isTrashed=true",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
        addNewUser: builder.mutation({
            query: (data) => ({
                url: "/user/register",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                url: "/user/profile",
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
        changePassword: builder.mutation({
            query: (data) => ({
                url: "/user/change-password",
                method: "PUT",
                body: data,
            }),
        }),
        userAction: builder.mutation({
            query: (id) => ({
                url: `/user/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["User"],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/user/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),
        deleteRestoreUser: builder.mutation({
            query: ({ id, actionType }) => ({
                url: `/user/delete-restore/${id || ""}?actionType=${actionType}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),

        // Dashboard Endpoints
        getDashboardStats: builder.query({
            query: () => ({
                url: "/task/dashboard",
                method: "GET",
            }),
            providesTags: ["Task"],
        }),

        // Notification Endpoints
        getNotifications: builder.query({
            query: () => ({
                url: "/user/notifications",
                method: "GET",
            }),
            providesTags: ["Notice"],
        }),
        markNotiAsRead: builder.mutation({
            query: (data) => ({
                url: `/user/read-noti?isReadType=${data.type}&id=${data.id || ""}`,
                method: "PUT",
            }),
            invalidatesTags: ["Notice"],
        }),

        // Task Endpoints
        getTasks: builder.query({
            query: (params = {}) => {
                const { stage = "", isTrashed = false } = params;
                return {
                    url: `/task?stage=${stage}&isTrashed=${isTrashed}`,
                    method: "GET",
                };
            },
            providesTags: ["Task"],
        }),

        getTaskDetail: builder.query({
            query: (id) => ({
                url: `/task/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Task", id }],
        }),

        createTask: builder.mutation({
            query: (data) => ({
                url: "/task/create",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Task", "Notice"],
        }),

        duplicateTask: builder.mutation({
            query: (id) => ({
                url: `/task/duplicate/${id}`,
                method: "POST",
            }),
            invalidatesTags: ["Task", "Notice"],
        }),

        updateTask: builder.mutation({
            query: ({ id, data }) => ({
                url: `/task/update/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                "Task",
                { type: "Task", id },
                "Notice",
            ],
        }),

        trashTask: builder.mutation({
            query: (id) => ({
                url: `/task/trash/${id}`,
                method: "PUT",
            }),
            invalidatesTags: (result, error, id) => ["Task", { type: "Task", id }],
        }),

        deleteRestoreTask: builder.mutation({
            query: ({ id, actionType }) => ({
                url: `/task/delete-restore/${id || ""}?actionType=${actionType}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Task"],
        }),

        createSubTask: builder.mutation({
            query: ({ id, data }) => ({
                url: `/task/create-subtask/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                "Task",
                { type: "Task", id },
            ],
        }),

        postTaskActivity: builder.mutation({
            query: ({ id, data }) => ({
                url: `/task/activity/${id}`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                "Task",
                { type: "Task", id },
            ],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetTeamListQuery,
    useGetTrashedUsersQuery,
    useAddNewUserMutation,
    useUpdateUserMutation,
    useChangePasswordMutation,
    useUserActionMutation,
    useDeleteUserMutation,
    useDeleteRestoreUserMutation,
    useGetDashboardStatsQuery,
    useGetNotificationsQuery,
    useMarkNotiAsReadMutation,
    useGetTasksQuery,
    useGetTaskDetailQuery,
    useCreateTaskMutation,
    useDuplicateTaskMutation,
    useUpdateTaskMutation,
    useTrashTaskMutation,
    useDeleteRestoreTaskMutation,
    useCreateSubTaskMutation,
    usePostTaskActivityMutation,
} = apiSlice;