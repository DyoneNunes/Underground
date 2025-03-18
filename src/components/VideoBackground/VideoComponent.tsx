import * as S from './BackgroundStyles';
import backgroundVideo from "../../assets/video/background.mp4";
import backgroundImage from "../../assets/images/background.jpg";
import Header from "../Header/Header";
import Image from '../Image/Image';

function Background() {
    return (
        <S.LandingPage>
            <img
                src={backgroundImage}
                alt="Botão de navegação"
                style={{ width: "100%", height: "auto", position: "absolute", top: "0", zIndex: "-1" }}
            />

            <Header />
        </S.LandingPage>
    );
}

export default Background;
