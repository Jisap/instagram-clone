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
