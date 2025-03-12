import React from "react";
import { useNavigate } from "react-router-dom";
import BlogPostCard from "../../../components/BlogPostCard/BlogPostCard";
import TinySlider from "tiny-slider-react";
import "tiny-slider/src/tiny-slider.scss"; // Importação correta dos estilos
import "./BlogSection.css"; // Estilos personalizados

const BlogSection = () => {
    const navigate = useNavigate();

    const tinySliderSettings = {
        items: 1,
        autoplay: true,
        controls: false,
        nav: true,
        speed: 400,
        autoplayButtonOutput: false, // Evita que um botão de autoplay seja renderizado
    };

    // Lista de posts com as rotas associadas
    const posts = [
        { image: "lion.jpg", imageWebp: "lion.webp", alt: "Imagem do Lion", title: "Lion", text: "Descubra mais!", date: "01/01/2024", route: "/Lion" },
        { image: "jv.jpg", imageWebp: "jv.webp", alt: "Imagem do JvTattoo", title: "JvTattoo", text: "Tatuagens incríveis!", date: "02/01/2024", route: "JvTattoo" },
        { image: "moretto.jpg", imageWebp: "moretto.webp", alt: "Imagem do Moretto", title: "Moretto", text: "Estilo único!", date: "03/01/2024", route: "Moretto" },
        { image: "scheffer.jpg", imageWebp: "scheffer.webp", alt: "Imagem do Scheffer", title: "Scheffer", text: "Criatividade pura!", date: "04/01/2024", route: "Scheffer" },
    ];

    interface Post {
        image: string;
        imageWebp: string;
        alt: string;
        title: string;
        text: string;
        date: string;
        route: string;
    }

    const handleNavigation = (route: string): void => {
        navigate(route);
    };

    return (
        <div className="slider-container">
            <TinySlider settings={tinySliderSettings}>
                {posts.map((post) => (
                    <div key={post.title} onClick={() => handleNavigation(post.route)} style={{ cursor: "pointer" }}>
                        <BlogPostCard {...post} />
                    </div>
                ))}
            </TinySlider>
        </div>
    );
};

export default BlogSection;
