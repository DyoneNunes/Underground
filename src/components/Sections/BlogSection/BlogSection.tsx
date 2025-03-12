import { useNavigate } from "react-router-dom";
import BlogPostCard from "../../BlogPostCard/BlogPostCard"; // Verifique se o caminho está correto!
import "./BlogSection.css"


export type BlogPostCardType = {
    image: string;
    imageWebp: string;
    alt: string;
    title: string;
    text: string;
    date: string;
    route: string; // Adicionado para garantir que `route` está no objeto
};

const BlogSection = ({ posts }: { posts: BlogPostCardType[] }) => {
    const navigate = useNavigate();

    const handleNavigation = (route: string) => {
        if (route) {
            navigate(route);
        }
    };

    return (
        <div className="slider-container">
            {posts.map((post, index) => (
                <div 
                    key={index} 
                    onClick={() => handleNavigation(post.route)} 
                    style={{ cursor: "pointer" , display: "flex", flexDirection: "column", alignItems: "center"}}
                >
                    <BlogPostCard {...post} />
                </div>
            ))}
        </div>
    );
};

export default BlogSection;
