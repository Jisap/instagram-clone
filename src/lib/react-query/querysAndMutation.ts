import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { 
  createUserAccount,
  signInAccount, 
  signOutAccount
} from "../appwrite/api";
import { INewUser } from "@/types";

// ============================================================
// AUTH QUERIES
// ============================================================

export const useCreateUserAccount = () => {         // Tanstack query usa la mutation de Appwrite para hacer la creación del user
  return useMutation({
    mutationFn: (user:INewUser) => createUserAccount(user)
  })
}

export const useSignInAccount = () => {         
  return useMutation({
    mutationFn: (user: { email: string; password: string; }) => signInAccount(user)
  })
}

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};
