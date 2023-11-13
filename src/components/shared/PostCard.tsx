import { Models } from "node_modules/appwrite/types/models";




type PostCardProps = {
  post: Models.Document;
};


const PostCard = ({ post }: PostCardProps) => {
  return (
    <div>PostCard</div>
  )
}

export default PostCard