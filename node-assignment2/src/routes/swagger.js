import swaggerUi from 'swagger-ui-express';
import swaggereJsdoc from 'swagger-jsdoc';

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'sparta-resume API',
      version: '1.0.0',
      description: 'API with express',
    },
    host: 'localhost:3001',
    basePath: '/',
  },
  apis: ['./src/routes/*.js', './swagger/*'],
};

const specs = swaggereJsdoc(options);

/**
 * @swagger
 * paths:
 *  /api/sign-up:
 *    post:
 *      tags:
 *      - users
 *      summary: 회원가입
 *      description: 회원가입
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type : string
 *                name:
 *                  type : string
 *                age:
 *                  type : integer
 *                gender:
 *                  type : string
 *      produces:
 *      - application/json
 *      responses:
 *       201:
 *        description: 회원가입 성공
 *       409:
 *        description: 이미 존재하는 이메일입니다.
 *       400:
 *        description: 요청 값 올바르지 않음.
 *  /api/sign-in:
 *    post:
 *      tags:
 *      - users
 *      summary: 로그인
 *      description: 로그인
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type : string
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 로그인 성공
 *       401:
 *        description: 이메일 혹은 비밀번호가 일치하지 않음
 *  /api/users:
 *    get:
 *      tags:
 *      - users
 *      summary: 유저 정보 조회
 *      description: 현재 로그인된 유저 정보 조회
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 유저 정보 조회 성공
 *    patch:
 *     tags:
 *       - users
 *     summary: 유저 정보 수정
 *     description: 유저 정보 수정
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type : integer
 *               gender:
 *                 type : string
 *     responses:
 *       200 :
 *          description: 사용자 정보 변경 성공.
 *       404 :
 *          description : 사용자 정보가 존재하지 않습니다.
 *  /api/make-resume:
 *    post:
 *      tags:
 *      - resumes
 *      summary: 이력서 생성
 *      description: 이력서 생성
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                content:
 *                  type : string
 *      produces:
 *      - application/json
 *      responses:
 *       201:
 *        description: 이력서 생성 완료
 *       400:
 *        description: 토큰이 존재하지 않습니다.
 *  /api/resumes:
 *    get:
 *      tags:
 *      - resumes
 *      summary: 모든 이력서 조회(관리자 전용)
 *      description: 모든 이력서 조회(관리자 전용)
 *      parameters:
 *        - name: orderKey
 *          in: query
 *          description: userId or status or createAt (default = createdAt)
 *          required: false
 *          schema:
 *            type: string
 *        - name: orderValue
 *          in: query
 *          description: ASC or DESC 공백은 DESC 처리
 *          required: false
 *          schema:
 *            type: string
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이력서 조회 완료
 *       400:
 *        description: 토큰이 존재하지 않습니다.
 *       401:
 *        description: 관리자 전용 접근 구역입니다.
 *  /api/resumes/{resumeId}:
 *    get:
 *      tags:
 *      - resumes
 *      summary: 특정 이력서 조회
 *      description: 특정 이력서 조회
 *      parameters:
 *        - name: resumeId
 *          in: path
 *          description: resumeId 입력
 *          required: true
 *          schema:
 *            type: string
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이력서 조회 완료
 *       400:
 *        description: 토큰이 존재하지 않습니다.
 *       404:
 *        description: 이력서 조회에 실패하였습니다.
 *       401:
 *        description: 본인의 이력서만 열람할 수 있습니다.
 *    patch:
 *      tags:
 *      - resumes
 *      summary: 특정 이력서 수정
 *      description: 특정 이력서 수정
 *      parameters:
 *        - name: resumeId
 *          in: path
 *          description: resumeId 입력
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *        required: false
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                content:
 *                  type : string
 *                status:
 *                  type : string
 *                  example : (APPLY / DROP / PASS / INTERVIEW1/  INTERVIEW2 / FINAL_PASS)
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이력서 수정 완료
 *       400:
 *        description: 토큰이 존재하지 않습니다.
 *       404:
 *        description: 이력서 조회에 실패하였습니다.
 *       401:
 *        description: 본인의 이력서만 수정할 수 있습니다.
 *    delete:
 *      tags:
 *      - resumes
 *      summary: 특정 이력서 삭제
 *      description: 특정 이력서 삭제
 *      parameters:
 *        - name: resumeId
 *          in: path
 *          description: resumeId 입력
 *          required: true
 *          schema:
 *            type: string
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 이력서 삭제 완료
 *       400:
 *        description: 토큰이 존재하지 않습니다.
 *       404:
 *        description: 이력서 조회에 실패하였습니다.
 *       401:
 *        description: 본인의 이력서만 삭제할 수 있습니다.
 */

export { swaggerUi, specs };
