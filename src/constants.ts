import { Hike } from './components/HikeCard/HikeCard';
import lakeImage from './assets/images/lake_in_mountains.jpg';
import lakeWebp from './assets/images/lake_in_mountains.webp';
import mountainsNight from './assets/images/nignt_in_mountains.jpg';
import mountainsNightWebp from './assets/images/nignt_in_mountains.webp';
import mountainsJoga from './assets/images/joga_in_mountains.jpg';
import mountainsJogaWebp from './assets/images/joga_in_mountains.webp';
import italyImg from './assets/images/italy_post.jpg';
import italyWebp from './assets/images/italy_post.webp';
import flightImg from './assets/images/flight_post.png';
import flightWebp from './assets/images/flight_post.webp';
import backpackImg from './assets/images/backpack_post.png';
import backpackWebp from './assets/images/backpack_post.webp';
import mosqueImg from './assets/images/mosque_post.png';
import mosqueWebp from './assets/images/mosque_post.webp';
import balloons from './assets/images/balloons.jpg';
import balloonsWebp from './assets/images/balloons.webp';
import lakeAndMountain from './assets/images/lake_and_mountain.jpg';
import lakeAndMountainWebp from './assets/images/lake_and_mountain.webp';
import palms from './assets/images/palms.jpg';
import palmsWebp from './assets/images/palms.webp';
import photosOnMap from './assets/images/photos_and_map.jpg';
import photosOnMapWebp from './assets/images/photos_and_map.webp';
import rainbow from './assets/images/rainbow.jpg';
import rainbowWebp from './assets/images/rainbow.webp';
import waterfall from './assets/images/waterfall.jpg';
import waterfallWebp from './assets/images/waterfall.webp';
import backpackerImg from './assets/images/advantages_backpacker_lake.jpg';
import backpackerWebp from './assets/images/advantages_backpacker_lake.webp';
import fieldMountainImg from './assets/images/advantages_field_mountain.jpg';
import fieldMountainWebp from './assets/images/advantages_field_mountain.webp';
import fireImg from './assets/images/advantages_fire.jpg';
import fireWebp from './assets/images/advantages_fire.webp';
import yellowCoatImg from './assets/images/advantages_yellow_coat.jpg';
import yellowCoatWebp from './assets/images/advantages_yellow_coat.webp';
import { BlogPostCardType } from './components/BlogPostCard/BlogPostCard';
import { GalleryPhotoType } from './components/PhotoGallery/SliderPhotoGallery';
import { NavLinkType } from './components/NavLink/NavLink';
import { ImageType } from './components/Image/Image';

export const HIKES: Hike[] = [
    {
        rating: 5.0,
        image: lakeImage,
        imageWebp: lakeWebp,
        title: 'Nome da Tattoo',
        subTitle: 'Tatoador',
        description:
            'testo de descriçao da tattoo.',
        price: 'R$ 2000',
    },
    {
        rating: 4.5,
        image: mountainsNight,
        imageWebp: mountainsNightWebp,
        title: 'Nome da Tattoo',
        subTitle: 'Tatoador',
        description:
            'testo de descriçao da tattoo.',
        price: 'R$ 2000',
    },
    {
        rating: 4.0,
        image: mountainsJoga,
        imageWebp: mountainsJogaWebp,
        title: 'Nome da Tattoo',
        subTitle: 'Tatoador',
        description:
            'testo de descriçao da tattoo.',
        price: 'R$ 2000',
    },
];

export const ADVANTAGES_IMAGES: ImageType[] = [
    {
        image: backpackerImg,
        imageWebp: backpackerWebp,
        alt: 'Путешественник на берегу озера',
    },
    {
        image: fieldMountainImg,
        imageWebp: fieldMountainWebp,
        alt: 'Поле перед горой',
    },
    {
        image: fireImg,
        imageWebp: fireWebp,
        alt: 'Ночной костёр',
    },
    {
        image: yellowCoatImg,
        imageWebp: yellowCoatWebp,
        alt: 'Девушка в жёлтой куртке',
    },
];

export const POSTS: BlogPostCardType[] = [
    {
        image: italyImg,
        imageWebp: italyWebp,
        alt: 'LionRanja',
        title: 'Lion',
        text: 'uma breve descriçao do serviço',
        date: 'Estilo de Tattoo',
    },
    {
        image: flightImg,
        imageWebp: flightWebp,
        alt: 'Scheffer tattoo',
        title: 'Scheffer',
        text: 'Uma breve descriçao de serviços.',
        date: 'estilo de tattoo',
    },
    {
        image: backpackImg,
        imageWebp: backpackWebp,
        alt: 'JV tattoo',
        title: 'Jv Tattoo',
        text: 'Uma breve descriçao de servço.',
        date: 'Pontilismo Geometrico',
    },
    {
        image: mosqueImg,
        imageWebp: mosqueWebp,
        alt: 'Moretto',
        title: 'Moretto',
        text: 'Uma breve descrição de serviço.',
        date: 'Estilo de tattoo',
    },
];

export const PHOTOS: GalleryPhotoType[] = [
    {
        image: balloons,
        imageWebp: balloonsWebp,
        description: 'Фестиваль воздушных шаров',
    },
    {
        image: lakeAndMountain,
        imageWebp: lakeAndMountainWebp,
        description: 'Озеро в горах',
    },
    { image: palms, imageWebp: palmsWebp, description: 'Райский пляж' },
    {
        image: photosOnMap,
        imageWebp: photosOnMapWebp,
        description: 'Прошлые и будущие путешествия',
    },
    { image: rainbow, imageWebp: rainbowWebp, description: 'Радуга' },
    {
        image: waterfall,
        imageWebp: waterfallWebp,
        description: 'Фантастический водопад',
    },
];

export const MENU_LINKS: NavLinkType[] = [
    { text: 'Inicial', href: '/' },
    { text: 'Sobre o guia', href: 'https://www.google.com'},
    { text: 'Programa turístico', href: '/'  },
    { text: 'Preço', href: '/'  },
    { text: 'Blogue', href: '/'  },
    { text: 'Contatos', href: '/'  },
];

export const FOOTER_LINKS1: NavLinkType[] = [
    { text: 'Прогулки в горы летом', href: '/'},
    { text: 'Зимние походы в горы', href: '/'  },
    { text: 'Посещение храмов в горах', href: '/'  },
    { text: 'Экстремальные виды туризма', href: '/'  },
    { text: 'Походы в джунглях Амазонииы', href: '/'  },
    { text: 'Поездка в Африку', href: '/'  },
];

export const FOOTER_LINKS2: NavLinkType[] = [
    { text: 'Как собрать в долгий поход?', href: '/'  },
    { text: 'Жизненно важные предметы для похода', href: '/'  },
    { text: 'Медицинская страховка, гарантии безопасности', href: '/'  },
    { text: 'Если вы врач - загляните сюда', href: '/'  },
];

export const TINY_SLIDER_SETTINGS = {
    lazyload: false,
    nav: true,
    mouseDrag: true,
    controls: false,
    gutter: 10,
    // fixedWidth: 380,
    autoWidth: true,
    center: true,
};
