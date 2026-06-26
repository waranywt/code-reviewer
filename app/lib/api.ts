import axios from "axios";

const client = axios.create({
  headers: { "Content-Type": "application/json" },
});

export const api = {
  get: async <T>(url: string): Promise<T> => {
    const r = await client.get<T>(url);
    return r.data;
  },
  post: async <T>(url: string, data?: unknown): Promise<T> => {
    const r = await client.post<T>(url, data);
    return r.data;
  },
  put: async <T>(url: string, data?: unknown): Promise<T> => {
    const r = await client.put<T>(url, data);
    return r.data;
  },
  delete: async <T>(url: string): Promise<T> => {
    const r = await client.delete<T>(url);
    return r.data;
  },
};
