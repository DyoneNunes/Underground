import * as S from './BackgroundStyles';
import backgroundVideo from "../../assets/video/background.mp4";
import Header from "../Header/Header";

function Background() {
    return (
        <S.LandingPage>
            <S.VideoBg src={backgroundVideo} autoPlay muted loop />
            
            <Header />
        </S.LandingPage>
    );
}

export default Background;
