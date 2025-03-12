import React from 'react';
import * as S from './AdvantagesSection.Styled';
import * as T from '../../Text/TextStyles';
import ColoredSection from '../../Section/ColoredSection';
import { TouristsIcon } from '../../Icons/TouristsIcon';
import { ShieldIcon } from '../../Icons/ShieldIcon';
import { LabelIcon } from '../../Icons/LabelIcon';
import AdvantageIconCard from '../../AdvantageIconCard/AdvantageIconCard';
import SectionHeader from '../../SectionHeader/SectionHeader';

const AdvantagesSection: React.FC = () => {
    return (
        <ColoredSection backgroundColor="#F3F5F4">
            <S.StyledAdvantagesSection>
                <div className="article-outer">
                    <article className="article">
                        <SectionHeader
                            description="localização"
                            title="Aqui estão nossos contatos e nossa localização"
                        />

                        <div className="advantages">
                            <AdvantageIconCard color={'#E5EEEB'}>
                                <TouristsIcon />
                            </AdvantageIconCard>
                            <div className="advantage">
                                <T.Title4>Entre em contato pelo nosso whatsapp</T.Title4>
                                <T.Text2><a href='https://w.app/eqzrmp' className="custom-button" target="_blank" rel="noopener noreferrer">
                                    Ir para Whatsapp
                                </a></T.Text2>
                                <T.Text2></T.Text2>
                            </div>

                            <AdvantageIconCard color={'#E3E6EE'}>
                                <ShieldIcon />
                            </AdvantageIconCard>
                            <div className="advantage">
                                <T.Title4>Ambiente limpo, seguro e monitorado.</T.Title4>
                                <T.Text2>Espaço organizado, higienizado e monitorado para sua segurança e conforto.</T.Text2>
                            </div>

                            <AdvantageIconCard color={'#F3F1E1'}>
                                <LabelIcon />
                            </AdvantageIconCard>
                            <div className="advantage">
                                <T.Title4>Bem Localizado</T.Title4>
                                <T.Text2>Bem localizado, com fácil acesso e comodidade para sua melhor experiência.</T.Text2>
                            </div>
                        </div>
                    </article>
                </div>

                <div className="gallery-outer">
                    <div className="gallery">
                        {/* Corrigido o estilo do iframe */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d233.92967184795936!2d-40.263672849178775!3d-20.264028626974536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1740091292466!5m2!1spt-BR!2sbr"
                            width="600"
                            height="450"
                            style={{ borderRadius: 20, border: 0, marginBottom: '-250px' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </S.StyledAdvantagesSection>
        </ColoredSection>
    );
};

export default AdvantagesSection;
