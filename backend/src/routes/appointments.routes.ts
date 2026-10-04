import { Router } from 'express';
import prisma from '../lib/prisma';
import { Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest, canAccessSite, forbid, isSuperAdmin } from '../middlewares/auth.middleware';
import { publicFormLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled'];
const MAX_TEXT = 1000;

const tooLong = (...values: unknown[]) =>
  values.some(v => v !== undefined && v !== null && (typeof v !== 'string' || v.length > MAX_TEXT));

// Agendamento pertence ao site do profissional: SITE_ADMIN só mexe nos do próprio site
const requireAppointmentOwnership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: String(req.params.id) },
      select: { professional: { select: { siteId: true } } },
    });

    if (!appointment) {
      res.status(404).json({ error: 'Agendamento não encontrado' });
      return;
    }

    if (!canAccessSite(req, appointment.professional.siteId)) {
      forbid(res);
      return;
    }

    next();
  } catch (error) {
    console.error('Appointment ownership check error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// GET /api/appointments/available?date=YYYY-MM-DD&professionalId=xxx
router.get('/available', async (req, res) => {
  try {
    const { date, professionalId } = req.query;

    if (!date || !professionalId) {
      res.status(400).json({ error: 'Data e profissional são obrigatórios' });
      return;
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay();

    // Get work schedule for this professional on this day
    const schedule = await prisma.workSchedule.findUnique({
      where: {
        professionalId_dayOfWeek: {
          professionalId: professionalId as string,
          dayOfWeek,
        },
      },
    });

    if (!schedule || !schedule.active) {
      res.json({ available: false, slots: [], message: 'Profissional não atende neste dia' });
      return;
    }

    // Get existing appointments for this date and professional
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        professionalId: professionalId as string,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: 'cancelled' },
      },
      select: { time: true },
    });

    const bookedTimes = existingAppointments.map(a => a.time);

    // Generate available slots
    const slots: string[] = [];
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const duration = schedule.slotDuration;

    for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      if (!bookedTimes.includes(timeStr)) {
        slots.push(timeStr);
      }
    }

    res.json({ available: true, slots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Erro ao buscar horários disponíveis' });
  }
});

// GET /api/appointments?date=&professionalId= (admin)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { date, professionalId, status } = req.query;
    const where: any = {};

    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }

    if (professionalId) where.professionalId = professionalId;
    if (status) where.status = status;
    if (!isSuperAdmin(req)) where.professional = { siteId: req.userSiteId || '__no_site__' };

    const appointments = await prisma.appointment.findMany({
      where,
      include: { professional: { select: { name: true, imageUrl: true } } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// POST /api/appointments (public)
router.post('/', publicFormLimiter, async (req, res) => {
  try {
    const { clientName, clientPhone, clientEmail, professionalId, date, time, service, notes } = req.body;

    if (!clientName || !clientPhone || !professionalId || !date || !time) {
      res.status(400).json({ error: 'Nome, telefone, profissional, data e hora são obrigatórios' });
      return;
    }

    if (tooLong(clientName, clientPhone, clientEmail, professionalId, date, time, service, notes)
        || !/^\d{2}:\d{2}$/.test(time) || Number.isNaN(new Date(date).getTime())) {
      res.status(400).json({ error: 'Dados do agendamento inválidos' });
      return;
    }

    const professional = await prisma.professional.findFirst({
      where: { id: professionalId, active: true },
      select: { id: true },
    });

    if (!professional) {
      res.status(400).json({ error: 'Profissional inválido' });
      return;
    }

    // Check if slot is available
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.appointment.findFirst({
      where: {
        professionalId,
        date: { gte: startOfDay, lte: endOfDay },
        time,
        status: { not: 'cancelled' },
      },
    });

    if (existing) {
      res.status(409).json({ error: 'Este horário já está reservado' });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientPhone,
        clientEmail,
        professionalId,
        date: targetDate,
        time,
        service,
        notes,
      },
      include: { professional: { select: { name: true } } },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

// PUT /api/appointments/:id (admin)
router.put('/:id', authMiddleware, requireAppointmentOwnership, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const data: any = {};

    if (status) {
      if (!APPOINTMENT_STATUSES.includes(status)) {
        res.status(400).json({ error: 'Status inválido' });
        return;
      }
      data.status = status;
    }
    if (notes !== undefined) data.notes = notes;

    const appointment = await prisma.appointment.update({
      where: { id },
      data,
      include: { professional: { select: { name: true } } },
    });

    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

// DELETE /api/appointments/:id (admin)
router.delete('/:id', authMiddleware, requireAppointmentOwnership, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });
    res.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Erro ao excluir agendamento' });
  }
});

export default router;
