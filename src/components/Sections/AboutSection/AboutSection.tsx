import * as S from './AboutSectionStyles';
import * as T from '../../Text/TextStyles';
import ColoredSection from '../../Section/ColoredSection';
import { Button } from '../../Button/Button';
import houseVideoPreview from '../../../assets/images/house-video-preview.jpg';
import houseVideoPreviewWebp from '../../../assets/images/house-video-preview.webp';
import SectionHeader from '../../SectionHeader/SectionHeader';
import Image from '../../Image/Image';
import { useNavigate } from "react-router-dom";

const AboutSection = () => {
    const navigate = useNavigate();
    
    return (
        <ColoredSection>
            <S.StyledAboutSection>
                <div className="article-outer">
                    <article className="article">
                        <SectionHeader
                            description="Eventos Underground"
                            title="Nossos Eventos"
                        />
                        <T.Text1>
                            Aqui estao os nossos principais eventos
                        </T.Text1>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <button
                                style={{padding:10 , color: "#FDFDFD", backgroundColor: "#1A3E3E" }}
                                onClick={() => navigate("/Eventos")}
                            >
                                <text>Album de fotos</text>
                            </button>
                        </div>
                    </article>
                </div>
                <div className="image-outer">
                    <div className="image-wrapper">
                        <Image
                            className="image"
                            imageWebp={houseVideoPreviewWebp}
                            image={houseVideoPreview}
                            alt="Video preview"
                        />
                    </div>
                </div>
            </S.StyledAboutSection>
        </ColoredSection>
    );
};

export default AboutSection;
