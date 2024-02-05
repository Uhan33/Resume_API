import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

export default async function (req, res, next) {
  try {
    const { authorization } = req.cookies;
    if (!authorization)
      throw new Error("요청한 사용자의 토큰이 존재하지 않습니다.");

    const [tokenType, token] = authorization.split(" ");
    if (tokenType !== "Bearer")
      throw new Error("토큰 타입이 Bearer 형식이 아닙니다.");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    const userId = decodedToken.userId;
    if(!userId) throw new Error('로그인이 필요합니다.');

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!user) throw new Error("토큰 사용자가 존재하지 않습니다.");

    if(new Date().getTime() >= (decodedToken.exp-300)*1000) {
      const refreshToken = await prisma.tokenStorage.findFirst({
        where: {userId: +userId}
      });
      if(refreshToken) {
        const token = jwt.sign({ userId: refreshToken.userId }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });
        res.cookie('authorization', `Bearer ${token}`);
        return res.status(401).json({message: "토큰이 만료되어 재발급하였습니다. 재시도 바랍니다."});
      }
    }
    const email = user.email;
    req.user = {userId, email};
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "토큰이 만료되었습니다." });
    }
    if (error.name === "JsonWebTokenError")
      return res.status(401).json({ message: "토큰이 조작되었습니다." });
    return res.status(400).json({ message: error.message });
  }
}
