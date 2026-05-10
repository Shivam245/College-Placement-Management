import { toast } from 'sonner';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    const error = data.error || response.statusText;
    if (response.status === 401) {
      // Unauthorized, could handle redirect to login here if needed
      // toast.error("Session expired. Please log in again.");
    }
    throw new Error(error);
  }
  
  return data;
}

export const api = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return handleResponse<T>(response);
  },

  async post<T>(url: string, body: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async patch<T>(url: string, body: any): Promise<T> {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    return handleResponse<T>(response);
  },

  async upload<T>(url: string, formData: FormData): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<T>(response);
  }
};
