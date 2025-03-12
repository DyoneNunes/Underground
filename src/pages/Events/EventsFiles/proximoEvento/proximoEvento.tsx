import React from "react";
import * as S from './proximoEventoStyles';
import backgroundVideo from "../../assets/video/background.mp4";
import Header from "../../../../components/Header/Header";

function proximoEvento() {
    return (
        <S.LandingPage>
            {/** Aqu va o proxmo evento underground */}
            <S.VideoBg src={backgroundVideo} autoPlay muted loop />
            
            <Header />
        </S.LandingPage>
    );
}

export default proximoEvento;
