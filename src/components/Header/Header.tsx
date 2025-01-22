import * as S from './HeaderStyles';
import BurgerMenu from '../BurgerMenu/BurgerMenu';
import Menu from '../Menu/Menu';
import Container from '../Container/Container';
import { LogoIcon } from '../Icons/LogoIcon';
import HikeSearchForm from '../HikeSearchForm/HikeSearchForm';
import { Button } from '../Button/Button';
import VideoBackground from '../VideoBackground/VideoComponent';
const Header = () => {
    return (
        <S.StyledHeader>
            <Container>
                
                <S.H1>
                    Bem vindo
                </S.H1>
                <S.H2>
                    EMBREVE TEREMOS NOVIDADE
                </S.H2>



            </Container>
        </S.StyledHeader>
    );
};

export default Header;
