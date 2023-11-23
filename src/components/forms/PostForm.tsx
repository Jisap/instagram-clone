import * as z from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import FileUploader from "../shared/FileUploader";
import { PostValidation } from "@/lib/validation";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/querysAndMutation";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "../ui/use-toast";
import Loader from "../shared/Loader";


type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};


const PostForms = ({ post, action }: PostFormProps) => {

  const { user } = useUserContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // 1. Define your form
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

  // Query
  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

  // 2. Define a submit handler
  async function onSubmit (values: z.infer<typeof PostValidation>){

    if (post && action === 'Update') {                              // ACTION = UPDATE
      const updatedPost = await updatePost({
        ...values,
        postId: post.$id,
        imageId: post.imageId,
        imageUrl: post.imageUrl,
      });

      if (!updatedPost) {
        toast({
          title: `${action} post failed. Please try again.`,
        });
      }
      return navigate(`/posts/${post.$id}`);
    }

    const newPost = await createPost({                               // ACTION = CREATE
      ...values,
      userId: user.id,
    })

    if(!newPost){
      toast ({
        title: 'Please try again',
      })
    }

    navigate('/')
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-x-5xk">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea placeholder="shadcn" {...field} className="shad-textarea custom-scrollbar"/>
              </FormControl>
              <FormMessage className="shad-form_message"/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader  
                  fieldChange={field.onChange} // Archivo a subir
                  mediaUrl={post?.mediaUrl}    // formato del file
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Tags (separated by comma " , ")</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" placeholder="Art, Expression, Learn" {...field}/>
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <div className="flex gap-4 items-center justify-end">
          <Button 
            type="button" 
            className="shad-button_dark_4"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default PostForms