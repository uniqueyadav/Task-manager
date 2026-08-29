import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: localStorage.getItem("userInfo") ?
        JSON.parse(localStorage.getItem("userInfo")) :
        null,
    token: localStorage.getItem("token") || null, // Token state dynamic addition
    isSidebarOpen: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            // Expecting payload format: { user, token }
            const { user, token } = action.payload;

            state.user = user || action.payload; // Fallback if entire payload is user object
            if (token) {
                state.token = token;
                localStorage.setItem("token", token);
            }

            localStorage.setItem("userInfo", JSON.stringify(user || action.payload));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("userInfo");
            localStorage.removeItem("token");
        },
        setOpenSidebar: (state, action) => {
            state.isSidebarOpen = action.payload;
        },
    },
});

export const { setCredentials, logout, setOpenSidebar } = authSlice.actions;

export default authSlice.reducer;