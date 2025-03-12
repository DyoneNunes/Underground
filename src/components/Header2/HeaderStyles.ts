import styled from 'styled-components';
import mountainsJpg from '../../assets/images/mountains.jpg';
import pretoJpg from '../../assets/images/preto.jpg';
import mountainsWebp from '../../assets/images/mountains.webp';
import { commonTextStyles, TextProps } from '../Text/TextStyles';

export const StyledHeader = styled.section`
    display: flex;
    flex-direction: row;
    
    padding: 20px 0 50px;
    height: 100dvh;

    .menu-wrapper {
        display: flex;
        justify-content: space-between;
        height: 44px;
    }

    .hike-search-form {
        display: none;
    }

    .hike-search-btn {
        display: flex;
    }

    .custom-button {
        display: inline-block;
        padding: 10px 20px;
        background-color:rgb(57, 63, 51);
        color: white;
        text-decoration: none;
        border: none;
        border-radius: 20px;
        font-weight: bold;
        text-align: center;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .custom-button:hover {
        background-color:rgb(65, 99, 67);
    }


    @media (min-width: 1180px) {
        padding: 16px 0 82px;

        .hike-search-form {
            display: flex;
        }

        .hike-search-btn {
            display: none;
        }
    }
`;

export const H1 = styled.h1<TextProps>`
    ${commonTextStyles};
    color: #fdfdfd;
    font-size: 28px;
    line-height: 42px;
    margin: auto 0 32px;
    font-family: "Graduate", serif;
    font-weight: 700;
    font-style: normal;

    @media (min-width: 1180px) {
        font-size: 50px;
        font-weight: 700;
        line-height: 75px;
        letter-spacing: 1px;
        margin: auto 0 41px;
    }
`;
export const H2 = styled.h1<TextProps>`
    ${commonTextStyles};
    color: #fdfdfd;
    font-size: 28px;
    line-height: 42px;
    margin: auto 0 32px;
    font-family: "Graduate", serif;
    font-weight: 400;
    font-style: normal;

    @media (min-width: 1180px) {
        font-size: 50px;
        font-weight: 700;
        line-height: 75px;
        letter-spacing: 1px;
        margin: auto 0 41px;
    }
`;


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
        height: 120vh;
    }
`;

export const VideoBg = styled.video`
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    z-index: -1;
    object-fit: cover;
`;

export const BgOverlay = styled.div`
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    z-index: 0;
`;