import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { UserInfo, AuthState, LoginResponse } from "../types";
// Definir el estado inicial con tipo
interface AuthState {
  userInfo: UserInfo | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: any;
}

const initialState: AuthState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo") as string)
    : null,
  status: "idle",
  error: null,
};
// Acción asincrónica para refrescar el token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshTokenstore");
      const response = await axios.post("/auth/refresh-token", {
        refreshToken,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Crea un slice de Redux llamado 'auth'
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Reducer para establecer las credenciales del usuario
    setCredentials: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
      const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 1 día
      localStorage.setItem("expirationTime", expirationTime.toString());
      if (action.payload.refreshToken) {
        localStorage.setItem("refreshTokenstore", action.payload.refreshToken);
      }
    },
    // Reducer para cerrar sesión y eliminar las credenciales del usuario
    logout: (state) => {
      state.userInfo = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshToken.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userInfo = action.payload.userInfo;
        localStorage.setItem(
          "userInfo",
          JSON.stringify(action.payload.userInfo)
        );
        const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem("expirationTime", expirationTime.toString());
        localStorage.setItem("refreshTokenstore", action.payload.refreshToken);
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
