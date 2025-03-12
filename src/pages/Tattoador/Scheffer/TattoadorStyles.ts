import styled from 'styled-components';
import { commonTextStyles, TextProps } from '../../../components/Text/TextStyles';

// Container principal da página
export const LandingPage = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    position: relative;
    transition: 0.5s;
    font-family: "Merienda", serif;

    @media (min-width: 1180px) {
        height: 100vh;
    }
`;

// Vídeo de fundo
export const VideoBg = styled.video`
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    z-index: -1;
    object-fit: cover;
`;

// Camada de sobreposição escura
export const BgOverlay = styled.div`
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    z-index: 0;
`;

// Navbar com o menu hambúrguer
export const Navbar = styled.nav`
    width: 100%;
    position: absolute;
    top: 20px;
    display: flex;
    justify-content: flex-end;
    padding: 0 30px;
`;

export const Menu = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;

    div {
        width: 35px;
        height: 5px;
        background: #fff;
        border-radius: 2px;
    }
`;

// Seção de texto centralizado
export const HomeText = styled.div`
    text-align: center;
    color: #fff;
    font-family: "Graduate", serif;
    font-weight: 400;
    font-style: normal;
`;

export const H1 = styled.h1<TextProps>`
    ${commonTextStyles};
    font-size: 50px;
    line-height: 75px;
    font-family: "Graduate", serif;
    font-weight: 700;
    letter-spacing: 1px;
    margin-bottom: 20px;
    color: #fff;

    @media (max-width: 1180px) {
        font-size: 28px;
        line-height: 42px;
    }
`;

export const H2 = styled.h2<TextProps>`
    ${commonTextStyles};
    font-size: 28px;
    font-weight: 400;
    color: #fff;
    line-height: 42px;
    font-family: "Graduate", serif;

    @media (min-width: 1180px) {
        font-size: 40px;
        line-height: 50px;
    }
`;

