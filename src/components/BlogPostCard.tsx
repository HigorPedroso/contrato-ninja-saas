
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface BlogPostCardProps {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  authorImage: string;
  image: string;
  slug: string;
  category: string;
}

const BlogPostCard = ({
  title,
  excerpt,
  date,
  author,
  authorImage,
  image,
  slug,
  category,
}: BlogPostCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700">
            {category}
          </span>
        </div>
      </div>
      <CardHeader className="pb-2">
        <Link to={`/blog/${slug}`}>
          <h3 className="text-xl font-medium hover:text-brand-400 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600 line-clamp-3 mb-4">{excerpt}</p>
      </CardContent>
      <CardFooter className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <img
              src={authorImage}
              alt={author}
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
            <span className="text-sm text-gray-600">{author}</span>
          </div>
          <time className="text-sm text-gray-500">{date}</time>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlogPostCard;
