import swaggerUi from 'swagger-ui-express';
import swaggereJsdoc from 'swagger-jsdoc';

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: 'sparta-shop API',
            version: '1.0.0',
            description: 'API with express',
        },
        host: 'localhost:3000',
        basePath: '/'
    },
    apis: ['./routes/*.js', './swagger/*']
};

const specs = swaggereJsdoc(options);

/**
 * @swagger
 * paths:
 *  /api/products:
 *    get:
 *      tags:
 *      - products
 *      summary: 모든 상품 조회
 *      description: 모든 상품 조회
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 상품 조회 성공
 *  /api/products/for_sale:
 *    get:
 *      tags:
 *      - products
 *      summary: 판매 중인 상품 조회
 *      description: 판매 중인 상품 조회
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 상품 조회 성공
 *  /api/products/author:
 *    get:
 *      tags:
 *      - products
 *      summary: 특정 판매자의 상품 조회
 *      description: 특정 판매자의 상품 조회
 *      parameters:
 *         - in: query
 *           name: name
 *           required: true
 *           description: 판매자 이름
 *      produces:
 *      - application/json
 *      responses:
 *       200:
 *        description: 상품 조회 성공
 *  /api/product:
 *    post:
 *     tags:
 *       - product
 *     summary: 상품 등록
 *     description: 새로운 상품을 등록합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type : string
 *               author:
 *                 type : string
 *               password:
 *                 type : string
 *     responses:
 *       201 :
 *          description: 상품 등록 성공
 *          content:
 *             application/json:
 *                schema:
 *                   type: object
 *                   properties:
 *                     Massage:
 *                        type: string
 *                        example: 판매 상품을 등록하였습니다!
 *       400 :
 *          description : 상품 등록 실패
 *       500 :
 *          description : 서버 에러 발생
 *  /api/product/{productId}:
 *     get:
 *        tags:
 *          - product
 *        summary: 상품 상세 조회
 *        description: 상품 상세 조회
 *        produces:
 *          - application/json
 *        parameters:
 *          - in: path
 *            name: productId
 *            required: true
 *            schema:
 *              type: string
 *              description: 상품 ID
 *        responses:
 *         200:
 *          content:
 *             application/json:
 *                schema:
 *                   type: object
 *                   properties:
 *                     title:
 *                        type: string
 *                        example: 상품 타이틀
 *                     content:
 *                        type: string
 *                        example: 상품 내용
 *                     author:
 *                        type: string
 *                        example: 판매자 이름
 *                     password:
 *                        type: string
 *                        example: 비밀번호
 *                     status:
 *                        type: string
 *                        example: (FOR_SALE / SOLD_OUT)
 *                     createAt:
 *                        example: new Date()
 *         404:
 *          description: 상품 조회 실패(can't find the productID)
 *     patch:
 *        tags:
 *          - product
 *        summary: 상품 정보 수정
 *        description: 상품 정보 수정
 *        produces:
 *          - application/json
 *        parameters:
 *          - in: path
 *            name: productId
 *            required: true
 *            schema:
 *              type: string
 *              description: 상품 ID
 *        requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  title:
 *                    type: string
 *                  content:
 *                    type : string
 *                  author:
 *                    type : string
 *                  password:
 *                    type : string
 *                    required: true
 *                  status:
 *                    type: string
 *                    example: (FOR_SALE / SOLD_OUT)
 *        responses:
 *          200 :
 *             description: 상품 정보 수정 성공
 *             content:
 *                application/json:
 *                   schema:
 *                      type: object
 *                      properties:
 *                        Massage:
 *                           type: string
 *                           example: 상품 정보를 수정하였습니다.
 *          400 :
 *             description: 데이터 형식이 올바르지 않음(productId is null or password is null or status is not FOR_SALE or SOLD_OUT)
 *          401 :
 *             description: 상품 수정 권한 없음(password wrong)
 *          404 :
 *             description: 상품 조회 실패(can't find the productID)
 *     delete:
 *        tags:
 *          - product
 *        summary: 상품 삭제
 *        description: 상품 삭제
 *        produces:
 *          - application/json
 *        parameters:
 *          - in: path
 *            name: productId
 *            required: true
 *            schema:
 *              type: string
 *              description: 상품 ID
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  password:
 *                    type: string
 *        responses:
 *           200 :
 *              description: 상품 삭제 완료
 *              content:
 *                application/json:
 *                   schema:
 *                      type: object
 *                      properties:
 *                        Massage:
 *                           type: string
 *                           example: 상품이 삭제되었습니다.
 *           400 :
 *              description: 데이터 형식이 올바르지 않음(productId is null or password is null)
 *           401 :
 *              description: 상품 삭제 권한 없음(password wrong)
 *           404 :
 *              description: 상품 조회 실패(can't find the productID)
 * 
 */

export {
    swaggerUi, specs
};