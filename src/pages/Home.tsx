import VideoBackground from '../components/VideoBackground/VideoComponent';
import ImageBackground from '../components/ImageBackground/ImageBackground';
import AboutSection from '../components/Sections/AboutSection/AboutSection';
import AdvantagesSection from '../components/Sections/AdvantagesSection/AdvantagesSection';
import PopularHikesSection from '../components/Sections/PopularHikesSection/PopularHikesSection';
import BlogSection from '../components/Sections/BlogSection/BlogSection';
import {
    HIKES,
    PHOTOS,
    TINY_SLIDER_SETTINGS,
} from '../constants';
import GallerySection from '../components/Sections/GallerySection/GallerySection';
import FooterSection from '../components/Sections/FooterSection/FooterSection';
import CompanyInfoSection from '../components/Sections/CompanyInfoSection/CompanyInfoSection';

const HomePage = () => {
    return (
        <>
            <ImageBackground />
            {/* <VideoBackground /> */}
            <BlogSection
                posts={[
                    { image: require("../assets/images/Lion.jpg"), imageWebp: require("../assets/images/Lion.webp"), alt: "Lion", title: "Lion", text: "Descubra mais!", date: "Realismo / Oriental", route: "/Lion" },
                    { image: require("../assets/images/Jv.jpg"), imageWebp: require("../assets/images/JvTattoo.webp"), alt: "JvTattoo", title: "JvTattoo", text: "Tatuagens incríveis!", date: "Pontilismo / Floral", route: "/JvTattoo" },
                    { image: require("../assets/images/Moretto.jpg"), imageWebp: require("../assets/images/Moretto.webp"), alt: "Moretto", title: "Moretto", text: "Estilo único!", date: "Realismo / BlackWork", route: "/Moretto" },
                    { image: require("../assets/images/Scheffer.jpg"), imageWebp: require("../assets/images/Scheffer.webp"), alt: "Scheffer", title: "Scheffer", text: "Criatividade pura!", date: "Tattoo / Bodypiercing", route: "/Scheffer" }
                ]}
                />
            <PopularHikesSection
                hikes={HIKES}
                tinySliderSettings={TINY_SLIDER_SETTINGS}
            />
            <AdvantagesSection />
            <AboutSection />
            <GallerySection
                photos={PHOTOS}
                tinySliderSettings={TINY_SLIDER_SETTINGS}
            />
            <FooterSection />
            <CompanyInfoSection />
        </>
    );
};

export default HomePage;
