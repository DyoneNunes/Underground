import * as S from './HeaderStyles';
import { useNavigate } from "react-router-dom";
import BurgerMenu from '../BurgerMenu/BurgerMenu';
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
                            style={{ width: "75px", height: "75px", borderRadius: "50%" }}
                        />
                    </button>
                    {/*<Menu />/*/}

                </header>
                <S.H1>
                    UNDERGROUND TATTOO STUDIO
                </S.H1>

            </Container>
        </S.StyledHeader>
    );
};

export default Header;
