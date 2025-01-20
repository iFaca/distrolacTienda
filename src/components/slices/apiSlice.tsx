import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants";
import { RootState } from "../../types";

// Tipo para la configuración de baseQuery
interface BaseQueryConfig {
  baseUrl: string;
  prepareHeaders: (
    headers: Headers,
    api: { getState: () => RootState }
  ) => Headers;
  credentials: RequestCredentials;
}

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
  credentials: "include" as const,
} as BaseQueryConfig);

// Definir tipos para las etiquetas
type TagTypes = "User";

// Crear un slice de API usando createApi y baseQuery configurado
export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User"] as TagTypes[],
  endpoints: (builder) => ({}),
});

// Tipos para endpoints (si necesitas agregar algunos)
export interface ApiEndpoints {
  // Definir tipos para endpoints específicos si los necesitas
}

// Exportar tipos útiles para otros archivos
export type ApiSlice = typeof apiSlice;
