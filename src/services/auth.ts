import axios from "axios";
import { instance } from "./api";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await instance.post<LoginResponse>(
      "/api/Auth/login",
      payload,
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      if (typeof message === "string" && message.trim().length > 0) {
        throw new Error(message);
      }
    }

    throw new Error("Login failed. Check your credentials and try again.");
  }
}
