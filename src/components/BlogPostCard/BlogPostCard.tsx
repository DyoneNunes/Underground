import * as S from './BlogPostCard.Styled';
import * as T from '../Text/TextStyles';
import Image from '../Image/Image';
import { useNavigate } from "react-router-dom";

export type BlogPostCardType = {
    image: string;
    imageWebp: string;
    alt: string;
    title: string;
    text: string;
    date: string;
    route: string;  // 🚀 Adicionamos a rota ao tipo
};

const BlogPostCard = ({
    image,
    imageWebp,
    alt,
    title,
    text,
    date,
    route,  // 🚀 Recebemos a rota como prop
}: BlogPostCardType) => {
    const navigate = useNavigate();

    return (
        <S.StyledBlogPostCard onClick={() => navigate(route)}> 
            <div className="card">
                <div className="image-wrapper">
                    <Image
                        imageWebp={imageWebp}
                        image={image}
                        alt={alt}
                        className="image"
                    />
                </div>
                <div className="content">
                    <div className="title">
                        <S.H2>{title}</S.H2>
                    </div>
                    <div className="text">
                        <S.Text2>{text}</S.Text2>
                    </div>
                    <div className="footer">
                        <S.Text2 color={'#F2BE22'} weight={700}>
                            {date}
                        </S.Text2>
                        <T.StyledLink
                            className="read-link"
                            weight={700}
                            color={'#1A3E3E'}
                        to={route}>
                        Saiba mais
                        </T.StyledLink>
                    </div>
                </div>
            </div>
        </S.StyledBlogPostCard>
    );
};

export default BlogPostCard;
