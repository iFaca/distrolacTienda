// src/slices/usersApiSlice.ts
import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../../constants";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: `${BASE_URL}/auth/login`,
        method: "POST",
        body: credentials,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: `${BASE_URL}/auth/register`,
        method: "POST",
        body: userData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: `${BASE_URL}/auth/change-password`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    updateUserInfo: builder.mutation({
      query: (data) => ({
        url: `${BASE_URL}/auth/profile`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${BASE_URL}/auth/logout`,
        method: "POST",
      }),
    }),
  }),
});

// Exporta todos los hooks correctamente
export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useChangePasswordMutation,
  useUpdateUserInfoMutation, // Asegúrate de que esté exportado correctamente
} = usersApiSlice;
