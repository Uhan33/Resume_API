import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

router.post('/make-resume', authMiddleware, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const { userId } = req.user;

    const resume = await prisma.resumes.create({
      data: {
        userId: +userId,
        title: title,
        content: content,
      },
    });

    return res.status(201).json({ message: '이력서 생성 완료!' });
  } catch (error) {
    next(error);
  }
});

router.get('/resumes', authMiddleware, async (req, res, next) => {
  const { email } = req.user;
  console.log(email);
  let orderKey = req.query.orderKey ?? 'createdAt';
  let orderValue = req.query.orderValue;

  if (email !== 'superadmin') return res.status(401).json({ message: '관리자 전용 접근 구역입니다.' });

  if (orderKey !== 'userId' && orderKey !== 'status') orderKey = 'createdAt';

  if (!orderValue) orderValue = 'desc';
  else orderValue.toUpperCase() !== 'ASC' ? (orderValue = 'desc') : (orderValue = 'asc');

  const resumes = await prisma.resumes.findMany({
    select: {
      resumeId: true,
      title: true,
      user: {
        select: {
          userInfos: {
            select: {
              name: true,
            },
          },
        },
      },
      status: true,
      createdAt: true,
    },
    orderBy: {
      [orderKey]: orderValue,
    },
  });

  //   JSON 형태를 동일하게 바꿔주는 작업.
  // resumes.forEach(resume => {
  //   resume.name = resume.user.userInfos.name;
  //   delete resume.user;
  // })

  return res.status(200).json({ data: resumes });
});

router.get('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  const { resumeId } = req.params;
  const { userId, email } = req.user;

  const userResume = await prisma.resumes.findFirst({
    where: { resumeId: resumeId },
  });

  if (!userResume) return res.status(404).json({ message: '이력서 조회에 실패하였습니다.' });

  if (email !== 'superadmin') {
    if (userResume.userId !== userId) return res.status(401).json({ message: '본인의 이력서만 열람할 수 있습니다.' });
  }

  const resume = await prisma.resumes.findFirst({
    where: { resumeId: resumeId },
    select: {
      resumeId: true,
      title: true,
      content: true,
      user: {
        select: {
          userInfos: {
            select: {
              name: true,
            },
          },
        },
      },
      status: true,
      createdAt: true,
    },
  });

  res.status(200).json({ data: resume });
});

router.patch('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  try {
    const stat = ['APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS'];
    let check = false;
    const { resumeId } = req.params;
    const { userId, email } = req.user;
    const updatedResume = req.body;

    const userResume = await prisma.resumes.findFirst({
      where: { resumeId: resumeId },
    });

    if (!userResume) return res.status(404).json({ message: '이력서 조회에 실패하였습니다.' });

    if (email !== 'superadmin') {
      if (userResume.userId !== userId) return res.status(401).json({ message: '본인의 이력서만 수정할 수 있습니다.' });
    }

    for (let i of stat) {
      if (updatedResume.status === i) {
        check = true;
        break;
      }
    }

    if (!check) {
      return res.status(400).json({ message: '이력서의 상태가 올바르지 않습니다.' });
    }

    const resume = await prisma.resumes.update({
      where: { resumeId: resumeId },
      data: {
        ...updatedResume,
      },
    });

    return res.status(200).json({ message: '이력서가 수정되었습니다.' });
  } catch (error) {
    next();
  }
});

router.delete('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  const { resumeId } = req.params;
  const { userId, email } = req.user;

  const userResume = await prisma.resumes.findFirst({
    where: { resumeId: resumeId },
  });

  if (!userResume) return res.status(404).json({ message: '이력서 조회에 실패하였습니다.' });

  if (email !== 'superadmin') {
    if (userResume.userId !== userId) return res.status(401).json({ message: '본인의 이력서만 삭제할 수 있습니다.' });
  }

  const resume = await prisma.resumes.delete({
    where: { resumeId: resumeId },
  });

  return res.status(200).json({ message: '이력서를 삭제하였습니다.' });
});

export default router;
