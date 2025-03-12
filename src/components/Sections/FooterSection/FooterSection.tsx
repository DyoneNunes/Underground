import * as S from './FooterSection.Styled';
import * as T from '../../Text/TextStyles';
import Container from '../../Container/Container';
import { TelegramIcon } from '../../Icons/TelegramIcon';
import { VkIcon } from '../../Icons/VkIcon';
import { PinterestIcon } from '../../Icons/PinterestIcon';
import { SkypeIcon } from '../../Icons/SkypeIcon';
import IconButton from '../../IconButton/IconButton';

const FooterSection = () => {
    return (
        <S.StyledFooterSection>
            <Container>
                <div className="wrapper">
                    <div className="section contacts-wrapper">
                        <T.Title3 color="#F3F5F4" marginBottom={17}>
                            UNDERGROUND
                        </T.Title3>
                        <T.Text2 color="#fff" marginBottom={30}>
                            Respeite a tinta. Viva a rua. Sinta o drop. O underground não é um estilo, é uma atitude. Aqui, a pele conta histórias, o concreto é palco, e o som ecoa rebeldia. Seja na agulha, no shape ou no beat, o importante é deixar sua marca. Underground Tattoo Studio, aqui você encontra mais que uma tattoo, encontra cultura – onde a cultura de rua se encontra." 🎤🛹🔥
                        </T.Text2>
                        <div className="contacts">
                            <T.StyledLink to="./" color="#fff" underline>
                                udgtattoo027@gmail.com
                            </T.StyledLink>
                            <T.StyledLink to="./" color="#fff" underline>
                                +55 (27) 99999-9999
                            </T.StyledLink>
                        </div>
                        <div className="social-networks">
                            <IconButton
                                icon={TelegramIcon}
                                onClick={() => null}
                                ariaLabel="Telegram"
                            />
                            <IconButton
                                icon={VkIcon}
                                onClick={() => null}
                                ariaLabel="VK"
                            />
                            <IconButton
                                icon={PinterestIcon}
                                onClick={() => null}
                                ariaLabel="Pinterest"
                            />
                            <IconButton
                                icon={SkypeIcon}
                                onClick={() => null}
                                ariaLabel="Skype"
                            />
                        </div>
                    </div>
                    
                </div>
            </Container>
        </S.StyledFooterSection>
    );
};

export default FooterSection;
