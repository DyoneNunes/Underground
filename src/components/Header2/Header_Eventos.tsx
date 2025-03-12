import * as S from './HeaderStyles';
import Container from '../Container/Container';

const Header = () => {
    const handleClick = () => {
        window.location.href = "/";
    };
    
    return (
        <S.StyledHeader>
            <Container>
                <S.H1>
                    EMBREVE TEREMOS NOVIDADE
                </S.H1>
                <S.H2>
                    <button className="custom-button" onClick={handleClick}>
                        Voltar para inicio
                    </button>
                </S.H2>
            </Container>
        </S.StyledHeader>
    );
};

export default Header;
