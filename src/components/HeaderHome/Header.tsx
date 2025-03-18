
import * as S from './HeaderStyles';
import BurgerMenu from '../BurgerMenu/BurgerMenu';
import Container from '../Container/Container';
import { LogoIcon } from '../Icons/LogoIcon';
import HikeSearchForm from '../HikeSearchForm/HikeSearchForm';
import { Button } from '../Button/Button';

const Header = () => {
    return (
        <S.StyledHeader>
            <Container>
                <header className="menu-wrapper">
                    <LogoIcon />
                </header>
                <S.H1>
                    header Home
                </S.H1>
                <HikeSearchForm className="hike-search-form" />
                <div className="hike-search-btn">
                    <Button title="Найти программу" color="#1A3E3E" large />
                </div>
            </Container>
        </S.StyledHeader>
    );
};

export default Header;
