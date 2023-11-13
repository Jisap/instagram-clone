import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { 
  createPost,
  createUserAccount,
  getRecentPosts,
  signInAccount, 
  signOutAccount
} from "../appwrite/api";
import { INewPost, INewUser, IUpdatePost } from "@/types";
import { QUERY_KEYS } from "./queryKeys";

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

export const useCreatePost = () => {
  const queryClient = useQueryClient();               // Instancia de queryClient
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post), // Llamado a la mutation de la api de appwrite
    onSuccess: () => {                                // Si tiene éxito
      queryClient.invalidateQueries({                 // se realizará el refresco de la consulta
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],      // relativa a gentRecentPost -> cache actualizada
      });
    },
  });
};


export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};

// export const useUpdatePost = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (post: IUpdatePost) => updatePost(post),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({
//         queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
//       });
//     },
//   });
// };
