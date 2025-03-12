import * as S from './HeaderStyles';
import BurgerMenu from '../BurgerMenu/BurgerMenu';
import { useNavigate } from "react-router-dom";
import Container from '../Container/Container';
import Logo from '../../assets/images/logoUndergroundTattooStudio.jpg'

const Header = () => {
    const navigate = useNavigate();


    return (
        <S.StyledHeader>
            <Container>
                <header className="menu-wrapper">
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer"
                        }}
                    >
                        <img
                            src={Logo}
                            alt="Botão de navegação"
                            style={{ width: "50px", height: "50px" }}
                        />
                    </button>
                    <img src={Logo} style={{ width: '50px' }} />
                    {/*<Menu />/*/}

                    <BurgerMenu />
                </header>
                <S.H1>
                    UNDERGROUND TATTOO STUDIO
                </S.H1>

            </Container>
        </S.StyledHeader>
    );
};

export default Header;
