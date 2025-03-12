import React from "react";
import * as S from './HellowenStyles';
import backgroundVideo from "../../../../assets/video/background.mp4";
import Header from "../../../../components/Header2/Header_Eventos";

function Hellowen() {
    return (
        <S.LandingPage>
            <S.VideoBg src={backgroundVideo} autoPlay muted loop />
            
            <Header />
        </S.LandingPage>
    );
}

export default Hellowen;
