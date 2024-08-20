import axios, { AxiosError } from "axios";
import { parseCookies } from "nookies";
import { User } from "../interfaces";

type RequestSignInService = {
  email: string;
  password: string;
};

type ResponseSignInService = { access_token: string; user: User };

export async function SignInService(
  input: RequestSignInService
): Promise<ResponseSignInService> {
  try {
    const user = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/auth/sign-in`,
      data: {
        ...input,
      },
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "json",
    });
    return user.data;
  } catch (error: any) {
    console.error(error.response.data);
    throw error?.response?.data;
  }
}
