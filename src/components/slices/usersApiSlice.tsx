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
    // Añadir la mutación de registro
    register: builder.mutation({
      query: (userData) => ({
        url: `${BASE_URL}/auth/register`, // Ajusta la URL según tu API
        method: "POST",
        body: userData,
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

// Exportar ambos hooks
export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation, // Añadir esta exportación
} = usersApiSlice;
