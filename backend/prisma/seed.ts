import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Default Studio Tattoo & Templates...');

  // Clean existing tables (in order of relations)
  await prisma.appointment.deleteMany();
  await prisma.workSchedule.deleteMany();
  await prisma.heroImage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.event.deleteMany();
  await prisma.contactInfo.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.siteMusicLink.deleteMany();
  await prisma.user.deleteMany();
  await prisma.site.deleteMany();
  await prisma.radioTrack.deleteMany();
  await prisma.radioConfig.deleteMany();

  // Passwords
  const commonPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123', 10);

  // 1. Create Sites (Tattoo as Default, Barber & Store as Admin Templates)
  const tattooSite = await prisma.site.create({
    data: {
      slug: 'tattoo',
      name: 'Studio de Tattoo (Default)',
      title: 'A ARTE ENCONTRA A SUA PELE',
      subtitle: 'Transformamos suas ideias em obras de arte permanentes. Estilo, técnica e paixão.',
      badge: '🖋️ ESTÚDIO DEFAULT',
      accentColor: '#c41e3a',
      isDefault: true,
      isTemplate: false,
      hasAgenda: false,
      hasWhatsappCard: true,
      whatsappCardTitle: 'Orçamento Rápido via WhatsApp',
      whatsappCardText: 'Envie sua ideia de tatuagem, referência ou tamanho para receber uma estimativa direta com nossos artistas.',
      whatsappCardMessage: 'Olá! Gostaria de fazer um orçamento de tatuagem com o estúdio.',
      hasMusicPlayer: true,
      order: 1,
    },
  });

  const barberSite = await prisma.site.create({
    data: {
      slug: 'barber',
      name: 'Barbearia (Template)',
      title: 'DEFINA SEU ESTILO',
      subtitle: 'Cortes precisos, barba impecável e um ambiente que respira atitude.',
      badge: '💈 TEMPLATE BARBEARIA',
      accentColor: '#c9a96e',
      isDefault: false,
      isTemplate: true,
      hasAgenda: true, // Agenda tool enabled
      hasWhatsappCard: true,
      whatsappCardTitle: 'Agendamento Direto via WhatsApp',
      whatsappCardText: 'Prefere agendar pelo celular? Clique abaixo e fale diretamente com nossa recepção.',
      whatsappCardMessage: 'Olá! Gostaria de agendar um horário na barbearia.',
      hasMusicPlayer: true,
      order: 2,
    },
  });

  const storeSite = await prisma.site.create({
    data: {
      slug: 'store',
      name: 'Loja Underground (Template)',
      title: 'STREETWEAR & ATITUDE',
      subtitle: 'Vestuário autoral, camisetas exclusivas, moletons e acessórios com a essência underground.',
      badge: '👕 TEMPLATE LOJA',
      accentColor: '#3b82f6',
      isDefault: false,
      isTemplate: true,
      hasAgenda: false,
      hasWhatsappCard: true,
      whatsappCardTitle: 'Dúvidas sobre Encomendas & Tamanhos',
      whatsappCardText: 'Entre em contato com nossa equipe para tirar dúvidas sobre entregas, coleções ou pedidos personalizados.',
      whatsappCardMessage: 'Olá! Tenho uma dúvida sobre os produtos da Loja Underground.',
      hasMusicPlayer: true,
      order: 3,
    },
  });

  console.log('✅ Sites created:', [tattooSite.slug, barberSite.slug, storeSite.slug]);

  // 2. Create Users
  await prisma.user.create({
    data: {
      email: 'admin@underground.com',
      password: commonPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      email: 'tattoo@underground.com',
      password: commonPassword,
      name: 'Admin Tattoo',
      role: 'SITE_ADMIN',
      siteId: tattooSite.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'barber@underground.com',
      password: commonPassword,
      name: 'Admin Barber',
      role: 'SITE_ADMIN',
      siteId: barberSite.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'store@underground.com',
      password: commonPassword,
      name: 'Admin Store',
      role: 'SITE_ADMIN',
      siteId: storeSite.id,
    },
  });

  console.log('✅ Users created');

  // 3. Music Links per Site (Spotify / Audio / Links)
  await prisma.siteMusicLink.createMany({
    data: [
      { siteId: tattooSite.id, title: 'Playlist Underground Tattoo Vibes', artist: 'Curadoria Estúdio', url: 'https://open.spotify.com/playlist/37i9dQZF1DX8UebfRdwsOF', type: 'spotify', order: 1 },
      { siteId: tattooSite.id, title: 'Rock & Heavy Metal Collection', artist: 'Estúdio Tattoo 027', url: 'https://soundcloud.com', type: 'soundcloud', order: 2 },
      { siteId: barberSite.id, title: 'Hip Hop & Lo-Fi Beats for Barbering', artist: 'DJ Underground', url: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM', type: 'spotify', order: 1 },
      { siteId: storeSite.id, title: 'Streetwear Synthwave Mix', artist: 'Loja Underground', url: 'https://youtube.com', type: 'youtube', order: 1 },
    ],
  });

  console.log('✅ Music links seeded');

  // 4. Create Services
  const tattooServices = [
    { name: 'Blackwork', description: 'Tatuagens com preenchimento sólido em preto, designs impactantes e ousados.', order: 1 },
    { name: 'Realismo', description: 'Reprodução fiel de imagens com sombreamento detalhado e técnicas fotorrealistas.', order: 2 },
    { name: 'Old School', description: 'Estilo tradicional americano com linhas grossas e cores vibrantes.', order: 3 },
    { name: 'Fineline', description: 'Traços finos e delicados para designs minimalistas e elegantes.', order: 4 },
  ];

  for (const s of tattooServices) {
    await prisma.service.create({
      data: { ...s, imageUrl: '/uploads/images/placeholder.jpg', siteId: tattooSite.id },
    });
  }

  const barberServices = [
    { name: 'Corte Masculino', description: 'Corte personalizado de acordo com o estilo e formato do rosto.', order: 1 },
    { name: 'Barba Completa', description: 'Aparação e modelagem completa da barba com navalha e toalha quente.', order: 2 },
    { name: 'Combo Corte + Barba', description: 'Combo completo de corte masculino e barba com desconto especial.', order: 3 },
    { name: 'Degradê Navilhado', description: 'Corte com degradê lateral preciso, do zero ao topo.', order: 4 },
  ];

  for (const s of barberServices) {
    await prisma.service.create({
      data: { ...s, imageUrl: '/uploads/images/placeholder.jpg', siteId: barberSite.id },
    });
  }

  const storeServices = [
    { name: 'Camisetas Heavyweight 100% Algodão', description: 'Camisetas de alta gramatura com estampas autorais silk-screen exclusivas.', order: 1 },
    { name: 'Hoodies & Moletons Oversized', description: 'Moletons confortáveis com bordado premium e corte streetwear moderno.', order: 2 },
    { name: 'Bonés Snapback & Dad Hats', description: 'Bonés estruturados com aba curva/reta e logotipo Underground bordado em relevo.', order: 3 },
  ];

  for (const s of storeServices) {
    await prisma.service.create({
      data: { ...s, imageUrl: '/uploads/images/placeholder.jpg', siteId: storeSite.id },
    });
  }

  // 5. Create Professionals
  const tattooPros = [
    { name: 'Marcos Silva', bio: 'Especialista em blackwork e realismo com mais de 10 anos de experiência.', specialty: 'Blackwork / Realismo' },
    { name: 'Julia Santos', bio: 'Artista focada em fineline e aquarela, trazendo delicadeza a cada traço.', specialty: 'Fineline / Aquarela' },
  ];

  for (const p of tattooPros) {
    await prisma.professional.create({
      data: { ...p, imageUrl: '/uploads/images/placeholder.jpg', siteId: tattooSite.id },
    });
  }

  const barberPros = [
    { name: 'Lucas Oliveira', bio: 'Barbeiro premium com especialidade em degradê e cortes modernos.', specialty: 'Degradê' },
    { name: 'André Mendes', bio: 'Expert em barba, trabalhando com navalha e técnicas tradicionais.', specialty: 'Barba' },
  ];

  const createdBarberPros = [];
  for (const p of barberPros) {
    const created = await prisma.professional.create({
      data: { ...p, imageUrl: '/uploads/images/placeholder.jpg', siteId: barberSite.id },
    });
    createdBarberPros.push(created);
  }

  // 6. Work Schedules for Barber Template
  for (const pro of createdBarberPros) {
    for (let day = 1; day <= 6; day++) {
      await prisma.workSchedule.create({
        data: {
          professionalId: pro.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: day === 6 ? '14:00' : '18:00',
          slotDuration: 30,
        },
      });
    }
  }

  // 7. Contact Info
  await prisma.contactInfo.create({
    data: {
      siteId: tattooSite.id,
      phone: '(11) 99999-0001',
      whatsapp: '5511999990001',
      email: 'tattoo@underground.com',
      address: 'Rua das Artes, 123 - Centro',
      latitude: -23.5505,
      longitude: -46.6333,
      instagram: '@undergroundtattoo',
    },
  });

  await prisma.contactInfo.create({
    data: {
      siteId: barberSite.id,
      phone: '(11) 99999-0002',
      whatsapp: '5511999990002',
      email: 'barber@underground.com',
      address: 'Rua das Artes, 123 - Centro',
      latitude: -23.5505,
      longitude: -46.6333,
      instagram: '@undergroundbarber',
    },
  });

  await prisma.contactInfo.create({
    data: {
      siteId: storeSite.id,
      phone: '(11) 99999-0003',
      whatsapp: '5511999990003',
      email: 'loja@underground.com',
      address: 'Rua das Artes, 125 - Centro',
      latitude: -23.5505,
      longitude: -46.6333,
      instagram: '@undergroundstore',
    },
  });

  // 8. Radio Config
  await prisma.radioConfig.create({
    data: { isOnAir: true },
  });

  console.log('🎉 Seed completed with Default Tattoo Studio and Templates!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
