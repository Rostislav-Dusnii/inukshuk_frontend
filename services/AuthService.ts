import { NewUser, User } from "@types";

// Register a new user with backend
const register = (newUser: NewUser) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return fetch(apiUrl + "/users/create?code=" + newUser.code, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });
};

const loginUser = (user: User) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
};

const requestPasswordReset = (email: string) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/users/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
};

const resetPassword = (token: string, newPassword: string) => {
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/users/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });
};

const AuthService = {
  register,
  loginUser,
  requestPasswordReset,
  resetPassword,
};

export default AuthService;
