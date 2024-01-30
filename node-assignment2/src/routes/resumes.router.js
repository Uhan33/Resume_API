import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

// - API 호출 시 이력서 제목, 자기소개 데이터를 전달 받습니다.
// - 이력서 데이터의 상태는 다음과 같은 상태들 중 1개를 가지게 됩니다.
//     - 서류 지원 완료 `APPLY`
//     - 서류 탈락 `DROP`
//     - 서류 합격 `PASS`
//     - 1차 면접 `INTERVIEW1`
//     - 2차 면접 `INTERVIEW2`
//     - 최종 합격 `FINAL_PASS`
// - 이력서 등록 시 기본 상태는 지원 완료 (`APPLY`)입니다.
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

// - 이력서 ID, 이력서 제목, 자기소개, 작성자명, 이력서 상태, 작성 날짜 조회하기 (여러건)
//     - 작성자명을 표시하기 위해서는 이력서 테이블과 사용자 테이블의 JOIN이 필요합니다.
// - 이력서 목록은 QueryString으로 order 데이터를 받아서 정렬 방식을 결정합니다.
//     - orderKey, orderValue 를 넘겨받습니다.
//     - orderValue에 들어올 수 있는 값은 ASC, DESC 두가지 값으로 대소문자 구분을 하지 않습니다.
//     - ASC는 과거순, DESC는 최신순 그리고 둘 다 해당하지 않거나 값이 없는 경우에는 최신순 정렬을 합니다.
//     - 예시 데이터 : `orderKey=userId&orderValue=desc`
router.get('/resumes', async (req, res, next) => {
  // const userId = req.user;
  let orderValue = req.query.orderValue;

  if (!orderValue) orderValue = 'desc';
  else orderValue.toUpperCase() !== 'ASC' ? (orderValue = 'desc') : (orderValue = 'asc');

  const resumes = await prisma.resumes.findMany({
    orderBy: {
      createdAt: orderValue,
    },
  });

  return res.status(200).json({ data: resumes });
});

// - 이력서 ID, 이력서 제목, 자기소개, 작성자명, 이력서 상태, 작성 날짜 조회하기 (단건)
// - 작성자명을 표시하기 위해서는 상품 테이블과 사용자 테이블의 JOIN이 필요합니다.
router.get('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  const { resumeId } = req.params;

  const userResume = await prisma.resumes.findFirst({
    where: { resumeId: resumeId },
  });

  if (!userResume) return res.status(404).json({ message: '이력서 조회에 실패하였습니다.' });

  if (userResume.userId !== userId) return res.status(401).json({ message: '본인의 이력서만 열람할 수 있습니다.' });

  const resume = await prisma.resumes.findFirst({
    where: { resumeId: resumeId },
    select: {
      resumeId: true,
      title: true,
      content: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          userInfos: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json({ data: resume });
});

// - 이력서 제목, 자기소개, 이력서 상태 데이터로 넘겨 이력서 수정을 요청합니다.
// - 수정할 이력서 정보는 본인이 작성한 이력서에 대해서만 수정되어야 합니다.
// - 선택한 이력서가 존재하지 않을 경우, `이력서 조회에 실패하였습니다.` 메시지를 반환합니다.
router.patch('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  try {
    const stat = ['APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS'];
    let check = false;
    const { resumeId } = req.params;
    const { userId } = req.user;
    const updatedResume = req.body;

    const userResume = await prisma.resumes.findFirst({
      where: { resumeId: resumeId },
    });

    if (!userResume) return res.status(404).json({ message: '이력서 조회에 실패하였습니다.' });

    if (userResume.userId !== userId) return res.status(401).json({ message: '본인의 이력서만 수정할 수 있습니다.' });

    for(let i of stat) {
        if(updatedResume.status === i) {
            check = true;
            break;
        }
    }

    if(!check) {
        return res.status(400).json({message: '이력서의 상태가 올바르지 않습니다.'});
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

// - 이력서 ID를 데이터로 넘겨 이력서를 삭제 요청합니다.
// - 본인이 생성한 이력서 데이터만 삭제되어야 합니다.
// - 선택한 이력서가 존재하지 않을 경우, `이력서 조회에 실패하였습니다.` 메시지를 반환합니다.
router.delete('/resumes/:resumeId', authMiddleware, async (req, res, next) => {
  const { resumeId } = req.params;
  const { userId } = req.user;

  const userResume = await prisma.resumes.findFirst({
    where: { resumeId: resumeId },
  });

  if (!userResume) return res.status(404).json({ message: '이력서 조회에 실패하였습니다.' });

  if (userResume.userId !== userId) return res.status(401).json({ message: '본인의 이력서만 삭제할 수 있습니다.' });

  const resume = await prisma.resumes.delete({
    where: { resumeId: resumeId },
  });

  return res.status(200).json({ message: '이력서를 삭제하였습니다.' });
});

export default router;
