Website da underground tatto onde vamos fazer website hibrido tendo na primeira pagina dois caminhos que o usuario pode fazer. o primeiro caminho e para ele acessar o site do studio de tattoagem e o segundo caminho e para ele acessar o site da barbearia. os dois sites seriam com um design moderno e responsivo, cada um com suas particularidades e no header teria uma radio onde estaria rodando todas as musicas que ele quiser colocar para rodar em uma radio das musicas salvas.

o site do studio de tattoagem teria: 
o hiro seria um carrossel de imagens do estudio com uma mensagem de boas vindas para o usuario. 
abaixo do hiro teria uma secao de servicos que seriam as tatuagens que ele faz e uma breve descrição de cada uma com uma imagem referencia. 
abaixo da secao de servicos teria uma secao de tattuadores que seriam os tattuadores que trabalham no estudio com uma breve descrição de cada um com uma imagem referencia. 
abaixo da secao de tattuadores teria uma secao de eventos que seriam os eventos que o estudio participa ou promove. 
abaixo da secao de eventos teria uma secao de contato que seria um formulario de contato e um mapa do local. 

a barbearia
no hiro seria um carrossel das imagens dos cortes de cabelo feitos na barbearia e com uma mensagem de boas vindas. com um botao para agendamento de horario e disponibilização de horarios com o profissional disponivel para o corte. quero que mantenha a radio no header. 
abaixo do hiro teria uma secao de servicos que seriam os cortes de cabelo que ele faz e uma breve descrição de cada um com uma imagem referencia. 
abaixo da secao de servicos teria uma secao de profissionais que seriam os barbeiros que trabalham na barbearia com uma breve descrição de cada um com uma imagem referencia. 
abaixo da secao de profissionais teria uma secao de eventos que seriam os eventos que a barbearia participa ou promove. 
abaixo da secao de eventos teria uma secao de contato que seria um formulario de contato e um mapa do local. 

nisso tudo, precisamos adiminstrar isso tudo de forma bem simples, cada um com seu painel de adm para ele gerenciar seu site. o admin do studio de tattoagem precisa adicionar as fotos das tatuagens, os serviços, os tattuadores, os eventos e as informações de contato. o mesmo vale para a barbearia, só que os serviços da barbearia seriam os cortes de cabelo e as barbas.

o front-end seria feito com a biblioteca Next.js e o back-end seria feito com a framework express.js e o orm prisma e com banco de dados postgresql para armazenar todos os dados desde musica ate as imagens. 

o admin do studio de tattoagem teria a opção de adicionar, editar e excluir serviços, tattuadores, eventos e informações de contato. o mesmo vale para a barbearia, só que os serviços da barbearia seriam os cortes de cabelo e as barbas. 

como as duas coisas precisam de uma administração distinta, precisamos deixar isso bem claro para o usuário. e ambos precisam ter seu painel de administração separado para poder gerenciar seus sites mas acessados pelo mesmo dominio e pagina de login.

o admin deve ter as seguintes permissões:
- adicione, edite e exclua serviços
- adicione, edite e exclua tattuadores
- adicione, edite e exclua eventos
- adicione, edite e exclua informações de contato

o admin deve ter um botão para ligar e desligar a radio

sobre o agendamento, pode fazer via whatsapp e via site. mas no site o agendamento deve ser feito de forma simples e objetiva.

na questão do agendamento, o cliente vai escolher o profissional que ele quer ser atendido e vai escolher o dia e a hora. 

aqui está um exemplo de agendamento que ele pode seguir: 

1. ele escolhe o profissional que ele quer ser atendido
2. ele escolhe o dia e a hora
3. ele envia uma mensagem para o whatsapp informando que ele quer ser atendido


aqui está um exemplo de como o admin pode gerenciar o agendamento:

- ele pode adicionar, editar e excluir agendamentos

sobre a questão da administração, os dois precisam ter um painel de administração separado para poder gerenciar seus sites lembrando que ambos vao logar pelo mesmo dominio e tela de login.
