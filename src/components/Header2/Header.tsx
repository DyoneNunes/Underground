import * as S from './HeaderStyles';
import Container from '../Container/Container';

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
