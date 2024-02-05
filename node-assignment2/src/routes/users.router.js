import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import authMiddleware from '../middlewares/auth.middleware.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

router.post('/sign-up', async (req, res, next) => {
  try {
    const { email, clientId, password, passwordConfirm, name, age, gender } = req.body;

    if (!clientId) {
      if (!email) {
        return res.status(400).json({ message: '이메일은 필수입니다.' });
      }

      if (!password) {
        return res.status(400).json({ message: '비밀번호는 필수입니다.' });
      }

      if (!passwordConfirm) {
        return res.status(400).json({ message: '비밀번호 확인은 필수입니다.' });
      }
      if (password !== passwordConfirm) {
        return res.status(400).json({ message: '비밀번호와 비밀번호 확인값이 일치하지 않습니다.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
      }
    }

    if (!name) {
      return res.status(400).json({ message: '이름은 필수입니다.' });
    }

    if (clientId) {
      const isExistUser = await prisma.users.findFirst({
        where: { clientId },
      });

      if (isExistUser) {
        return res.status(409).json({ message: '이미 가입된 사용자입니다.' });
      }

      const [user, userInfo] = await prisma.$transaction(
        async (tx) => {
          const user = await tx.users.create({
            data: {
              clientId,
            },
          });

          const userInfo = await tx.userInfos.create({
            data: {
              userId: user.userId,
              name,
              age,
              gender,
            },
          });

          return [user, userInfo];
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
      );
    } else {
      const isExistUser = await prisma.users.findFirst({
        where: { email },
      });

      if (isExistUser) {
        return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [user, userInfo] = await prisma.$transaction(
        async (tx) => {
          const user = await tx.users.create({
            data: {
              email,
              password: hashedPassword,
            },
          });

          const userInfo = await tx.userInfos.create({
            data: {
              userId: user.userId,
              name,
              age,
              gender,
            },
          });

          return [user, userInfo];
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
      );
    }

    return res.status(201).json({ message: '회원가입 완료!' });
  } catch (error) {
    next(error);
  }
});

router.post('/sign-in', async (req, res, next) => {
  const { clientId, email, password } = req.body;
  let user;
  if (clientId) {
    user = await prisma.users.findFirst({
      where: { clientId },
    });

    if(!user) {
        return res.status(400).json({message: '로그인 정보가 맞지 않습니다.'});
    }
  } else {
    if (!email) {
      return res.status(400).json({ message: '이메일은 필수입니다.' });
    }

    if (!password) {
      return res.status(400).json({ message: '비밀번호는 필수입니다.' });
    }

    user = await prisma.users.findFirst({
      where: { email },
    });

    if (!user) return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  }

  const refreshToken = await prisma.tokenStorage.findFirst({
    where: { userId: +user.userId },
  });

  if (!refreshToken) {
    await prisma.tokenStorage.create({
      data: {
        refreshToken: jwt.sign({ userId: user.userId }, process.env.REFRESH_TOKEN_SECRET_KEY, {expiresIn: '7d'}),
        userId: +user.userId,
        ip: req.ip,
      },
    });
  }

  try {
    const decodedRefreshToken = jwt.verify(refreshToken.refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
  } catch(error) {
    if(error.name === "TokenExpiredError") {
        await prisma.tokenStorage.update({
            where: {userId: +user.userId},
            data: {
                refreshToken: jwt.sign({ userId: user.userId }, process.env.REFRESH_TOKEN_SECRET_KEY, {expiresIn: '7d'})
            }
        });
        console.log("refreshToken 재발급 완료.");
    }
  }

  const token = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '12h' });

  res.cookie('authorization', `Bearer ${token}`);
  return res.status(200).json({ message: '로그인에 성공하였습니다.' });
});

router.get('/users', authMiddleware, async (req, res, next) => {
  const { userId } = req.user;

  const user = await prisma.users.findFirst({
    where: { userId: +userId },
    select: {
      userId: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      userInfos: {
        select: {
          name: true,
          age: true,
          gender: true,
        },
      },
    },
  });

  return res.status(200).json({ data: user });
});

router.patch('/users', authMiddleware, async (req, res, next) => {
  const updatedData = req.body;
  const { userId } = req.user;

  const userInfo = await prisma.userInfos.findFirst({
    where: { userId: +userId },
  });
  if (!userInfo) return res.status(404).json({ message: '사용자 정보가 존재하지 않습니다.' });

  await prisma.$transaction(async (tx) => {
    await tx.userInfos.update({
      data: {
        ...updatedData,
      },
      where: {
        userId: +userId,
      },
    });

    for (let key in updatedData) {
      if (userInfo[key] !== updatedData[key]) {
        await tx.userHistories.create(
          {
            data: {
              userId: +userId,
              changedField: key,
              oldValue: String(userInfo[key]),
              newValue: String(updatedData[key]),
            },
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
          }
        );
      }
    }
  });

  return res.status(200).json({ message: '사용자 정보 변경에 성공하였습니다.' });
});

export default router;
