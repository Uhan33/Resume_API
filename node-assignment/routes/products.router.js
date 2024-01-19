import express from 'express';

const router = express.Router();

// 상품 목록 조회
router.get('/products', (req, res, next) => {

});

// 상품 등록
router.post('/product', (req, res, next) => {

});

// 상품 상세 조회
router.get('/products/:productId', (req, res, next) => {

});

// 상품 정보 수정
router.put('/procuts/:productId', (req, res, next) => {

});

// 상품 삭제
router.delete('/products/:productId', (req, res, next) => {

});

export default router;