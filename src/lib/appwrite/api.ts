import { ID, Query } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {

    const newAccount = await account.create(  // Crea la cuenta del usuario en el apartado de auth de appwrite
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if(!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({  // Grabamos en bd los datos del usuario más el avatarUrl si existe
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser; // Devolvemos el newuser

  } catch (error) {
    console.log(error);
    return error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);

    return session;
  } catch (error) {
    console.log(error);
  }
}


// ============================== GET USER
export async function getCurrentUser() {
  try {

    const currentAccount = await account.get();        // usuario logueado

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(  // Se pide una lista
      appwriteConfig.databaseId,                        // a la base de datos
      appwriteConfig.userCollectionId,                  // de todos los usuarios de la colección de usuarios
      [Query.equal("accountId", currentAccount.$id)]    // filtrando la lista para solo incluir a los usuarios cuya accountId == usuario logueado
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];                    // Se devuelve el primer usuario de la lista

  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    
    const uploadedFile = await uploadFile(post.file[0]);  // Upload file to appwrite storage

    if (!uploadedFile) throw Error;

   
    const fileUrl = getFilePreview(uploadedFile.$id);      // Get file url
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    
    const tags = post.tags?.replace(/ /g, "").split(",") || []; // Convert tags into array

   
    const newPost = await databases.createDocument(              // Create post
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,  // Actualiza el campo likes con el [] que viene como argumento
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId, // Aquí (saves) se graba la referencia al post actualizado en post
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {

  const hasFileToUpdate = post.file.length > 0; // Se comprueba que el post tiene un archivo a subir 

  try {
    let image = {
      imageUrl: post.imageUrl,  // url
      imageId: post.imageId,    // id
    };

    if (hasFileToUpdate) {                                  // Si hay archivo nuevo a subir
      
      const uploadedFile = await uploadFile(post.file[0]);  // se sube a AppWrite
      if (!uploadedFile) throw Error;

      const fileUrl = getFilePreview(uploadedFile.$id);     // Se obtiene su url
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);                 // y se borra el antiguo file
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id }; // Definimos el objeto image con la nueva url y file
    }

    const tags = post.tags?.replace(/ /g, "").split(",") || []; // Convert tags into array

    const updatedPost = await databases.updateDocument(       // Actualización del post
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId, // en el id existente
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      
      if (hasFileToUpdate) {              // Sino se actualizo borramos el file subido
        await deleteFile(image.imageId);
      }

      throw Error;                        // Y sino se subio el file lanzamos error
    }

    if (hasFileToUpdate) {                // Si si se actualizo y el file se subio
      await deleteFile(post.imageId);     // borramos la imagenId del post en bd
    }

    return updatedPost;

  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {

  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];   // Consultas a la bd ordenados por fecha y limitados a 9 rdos

  if (pageParam) {                                          // Si existe pageParam (cursor)
    queries.push(Query.cursorAfter(pageParam.toString()));  // se agrega una consulta adicional para obtener resultados después de un cursor específico
  }

  try {
    const posts = await databases.listDocuments(  // Consulta a la bd listando los documentos
      appwriteConfig.databaseId,                  // de la base de appWrite
      appwriteConfig.postCollectionId,            // en la colección de posts
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {

  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      
      const uploadedFile = await uploadFile(user.file[0]);    // Upload new file to appwrite storage
      if (!uploadedFile) throw Error;

      const fileUrl = getFilePreview(uploadedFile.$id);       // Get new file url
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const updatedUser = await databases.updateDocument(       //  Update user
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      
      if (hasFileToUpdate) {                        // Delete new file that has been recently uploaded
        await deleteFile(image.imageId);
      }
      
      throw Error;                                  // If no new file uploaded, just throw error
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
    
  } catch (error) {
    console.log(error);
  }
}
