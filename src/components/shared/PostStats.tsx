import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { checkIsLiked } from "@/lib/utils";
import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-query/querysAndMutation";

type PostStatsProps = {
  post?: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  
  const location = useLocation();
  const likesList = post?.likes.map((user: Models.Document) => user.$id); // Obtenemos los likes que tiene el post (cada like contiene el user que dio like)

  const [likes, setLikes] = useState<string[]>(likesList);  // Estado para likes con valor por defecto el que trae el post
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();               // Actualiza el campo likes con el [] que viene como argumento
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();        // Usuario logueado

  const savedPostRecord = currentUser?.save.find(             // Dentro de Appwrite buscamos en el campo save del usuario logueado
    (record: Models.Document) => record.post.$id === post?.$id // aquellos registros de posts === post.id que se esta pulsando para grabar
  );

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  const handleLikePost = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();

    let likesArray = [...likes];                              // Se establece el contenido de los likes[]

    if (likesArray.includes(userId)) {                        // Si este contenido incluye el usuario logueado 
      likesArray = likesArray.filter((Id) => Id !== userId);  // Se le filtra para que solo contenga los likes de otros users
    } else {
      likesArray.push(userId);                                // Si es otro usuario el que hace like se inserta en [likes]
    }

    setLikes(likesArray);
    likePost({ postId: post?.$id || '', likesArray });        // Se ejecuta la mutation
  }

  const handleSavePost = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();

    if (savedPostRecord) {                            // Si el usuario logueado ya grabo el post
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);     // quiere decir que quiere hacer la acción contraria desgrabar el post
    }

    savePost({ userId: userId, postId: post?.$id || '' });   // En caso contrario ejecuta la mutation para grabarla.
    setIsSaved(true);
  }

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";
  
  return (
    <div className={`flex justify-between items-center z-20 ${containerStyles}`}>
      <div className="flex gap-2 mr-5">
        <img
          src={`${checkIsLiked(likes, userId) // Comprueba que el userId esta dentro de la lista de likes
              ? "/assets/icons/liked.svg"     // Si esta icon de liked
              : "/assets/icons/like.svg"      // sino icon de like
            }`}
          alt="like"
          width={20}
          height={20}
          onClick={(e) => handleLikePost(e)}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="share"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={(e) => handleSavePost(e)}
        />
      </div>
    </div>
  )
}

export default PostStats