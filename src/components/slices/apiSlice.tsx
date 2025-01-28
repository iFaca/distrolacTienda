import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants";
import { RootState } from "../../types";

// Configuración de baseQuery con fetchBaseQuery
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Obtener el token del estado de Redux con tipado
    const token = (getState() as RootState).auth.userInfo?.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
  credentials: "include", // Asegúrate de que el backend esté preparado para manejar cookies si es necesario
});

// Crear un slice de API usando createApi y baseQuery configurado
export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User"], // Definimos las etiquetas si necesitamos gestionarlas en caché
  endpoints: (builder) => ({
    // Aquí puedes agregar los endpoints específicos para esta API
  }),
});

// Tipos para endpoints (si los necesitas)
export interface ApiEndpoints {
  // Definir tipos para endpoints específicos si los necesitas
}

// Exportar tipos útiles para otros archivos
export type ApiSlice = typeof apiSlice;
