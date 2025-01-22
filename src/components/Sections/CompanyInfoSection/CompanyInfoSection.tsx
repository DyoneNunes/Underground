import * as S from './CompanyInfoSection.Styled';
import * as T from '../../Text/TextStyles';
import Container from '../../Container/Container';

const CompanyInfoSection = () => {
    return (
        <S.StyledCompanyInfoSection>
            <Container paddingRight={0} paddingLeft={0} gap={8}>
                <div className="wrapper">
                    <T.Text3 color="#ffffff">Copyright UNDERGROUND, 2025</T.Text3>
                    
                </div>
            </Container>
        </S.StyledCompanyInfoSection>
    );
};

export default CompanyInfoSection;
