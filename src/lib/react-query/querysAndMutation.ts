import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { 
  createPost,
  createUserAccount,
  deletePost,
  deleteSavedPost,
  getCurrentUser,
  getInfinitePosts,
  getPostById,
  getRecentPosts,
  getUserPosts,
  likePost,
  savePost,
  searchPosts,
  signInAccount, 
  signOutAccount,
  updatePost
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

// ============================================================
// POST QUERIES
// ============================================================

export const useGetPosts = () => {

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],              // clave única de consulta "getInfinitePosts"
    queryFn: getInfinitePosts as any,                       // Función de appWrite para hacer la consulta
    getNextPageParam: (lastPage: any) => {                  // Los rdos de la consultan pasan a lastPage
      
      if (lastPage && lastPage.documents.length === 0) {    // Si no hay datos no hay más páginas
        return null;
      }

      const lastId = lastPage.documents[lastPage.documents.length - 1].$id; // Si hay datos se utiliza el $id de la último doc de la 
      return lastId;                                                        // última página como cursor para la siguiente página
    },
    initialPageParam: null  // La primera llamada a getInfinitePosts se hará sin un valor específico de pageParam
  });                       // Luego, el valor de pageParam se determina automáticamente por React Query utilizando la función getNextPageParam
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};

export const useGetRecentPosts = () => {
  return useQuery({                                   // useQuery se usa para realizar una consulta y obtener las publicaciones más recientes.
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],          // Identificador en cache
    queryFn: getRecentPosts,                          // Función de appWrite que se usa.
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};


export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, likesArray }: {postId: string; likesArray: string[];}) => likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};