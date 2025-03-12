import styled from 'styled-components';
import { commonTextStyles, TextProps } from '../Text/TextStyles';

type Props = {
    backgroundColor?: string | undefined;
};

export const StyledBlogPostCard = styled.div<Props>`
    .card {
        display: flex;
        flex-direction: column;
        width: 335px;
        height: 496px;
        background: #fff;
        border-radius: 6px;
        align-items: center;
        margin: 10px;
    }

    .image-wrapper {
        height: 280px;
    }

    .image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 6px 6px 0 0;
    }

    .content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        gap: 16px;
        padding: 16px;
        border-radius: 0 0 6px 6px;
    }

    .text {
        display: flex;
        flex-grow: 1;
    }

    .text > * {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        margin-bottom: auto;
    }

    .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .footer {
        display: flex;
        justify-content: space-between;
    }

    @media (min-width: 1440px) {
        .card {
            flex-direction: column;
            gap: 24px;
            width: 340px;
            height: 512px;
            padding: 16px;
            border-radius: 10px;
            margin: 10px;

            &:hover {
                .content {
                    .title,
                    .footer .read-link {
                        text-decoration-line: underline;
                    }
                }
            }
        }

        .image-wrapper {
            display: flex;
            flex: 0 0 230px;
            height: 280px;
            width: 280px;
            border-radius: 6px;
        }

        .image {
            border-radius: 6px;
        }

        .content {
            padding: 16px 0;
            gap: 24px;
            width: -webkit-fill-available;
            margin: inherit;
        }

        .text > * {
            -webkit-line-clamp: 4;
        }
    }
`;

export const H2 = styled.h2<TextProps>`
    ${commonTextStyles};
    font-size: 20px;
    font-weight: 700;
    line-height: 26px;

    @media (min-width: 1180px) {
        font-size: 24px;
        font-weight: 700;
        line-height: 32px;
    }
`;

export const Text2 = styled.p<TextProps>`
    ${commonTextStyles};
    font-size: 14px;
    line-height: 20px;
`;
