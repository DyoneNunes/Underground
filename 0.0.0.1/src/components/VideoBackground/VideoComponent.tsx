import React from "react";
import * as S from './BackgroundStyles';
import backgroundVideo from "../../assets/video/background.mp4";

function Background() {
    return (
        <S.LandingPage>
            <S.VideoBg src={backgroundVideo} autoPlay muted loop />
            <S.BgOverlay />
            <S.HomeText>
                <S.H1>UNDERGROUND TATTOO STUDIO</S.H1>
                <S.H2>EMBREVE MAIS NOVIDADES</S.H2>
            </S.HomeText>
        </S.LandingPage>
    );
}

export default Background;
