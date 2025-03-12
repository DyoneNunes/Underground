import Header from '../components/Header/Header';
import VideoBackground from '../components/VideoBackground/VideoComponent';
import CompanyInfoSection from '../components/Sections/CompanyInfoSection/CompanyInfoSection';
import AboutSection from '../components/Sections/AboutSection/AboutSection';
import { Menu } from '../components/VideoBackground/BackgroundStyles';

const HomePage = () => {
    return (
        <>
        {/**Esta pagina é uma pagina de suporte a cração de telas
         * 1. Crie um novo arquivo na pasta src/pages
         * 2. Copie o conteudo do arquivo src/pages/Home.tsx
         * 3. Cole o conteudo no novo arquivo
         * 4. Altere o conteudo conforme a necessidade
         * 5. Altere o nome do arquivo para o nome da nova tela
         * 6. Altere o nome da função para o nome da nova tela
         * 7. Altere o nome do export para o nome da nova tela
         * 8. Adicione a nova tela no arquivo src/App.tsx
         * 9. Adicione a nova tela no arquivo src/routes.tsx
         */}
            <VideoBackground/>
            <CompanyInfoSection />
        </>
    );
};

export default HomePage;
