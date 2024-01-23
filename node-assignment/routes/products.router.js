import express from 'express';
import Product from '../schemas/products.schema.js';
import joi from 'joi';

const router = express.Router();

const createdProductSchema = joi.object({
    title: joi.string().min(1).max(50).required(),
    content: joi.string().min(1).max(200).required(),
    author: joi.string().min(1).max(10).required(),
    password: joi.string().min(1).max(15).required(),
});

// 상품 목록 조회
router.get('/products', async (req, res, next) => {
    const products = (await Product.find().exec()).sort((a,b) => { return a.createAt < b.createAt ? 1 : -1});
    return res.status(200).json({ products });
});

// 상품 등록
router.post('/product', async (req, res, next) => {
    try {
        const validation = await createdProductSchema.validateAsync(req.body);

        const { title, content, author, password } = validation;

        const newProduct = new Product({
            title,
            content,
            author,
            password,
            status: 'FOR_SALE',
            createAt: new Date(),
        });

        await newProduct.save();

        res.status(201).json({ Message: '판매 상품을 등록하였습니다!' });
    } catch (error) {
        next(error);
    }
});

// 상품 상세 조회
router.get('/product/:productId', async (req, res, next) => {
    const { productId } = req.params;

    const product = await Product.findById(productId).exec();
    if (!product) {
        return res.status(404).json({ errorMassage: '존재하지 않는 상품 입니다.' });
    }

    return res.status(200).json({ product });
});

// 상품 정보 수정
router.patch('/product/:productId', async (req, res, next) => {
    const { productId } = req.params;
    const { title, content, password, status } = req.body;

    if (!productId || !password) {
        return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }

    const product = await Product.findById(productId).exec();

    if (!product) {
        return res.status(404).json({ errorMassage: '상품 조회에 실패하였습니다.' });
    } else {
        if (product.password !== password) {
            return res.status(401).json({ errorMassage: '상품을 수정할 권한이 없습니다.' });
        }

        if (status === 'fOR_SALE' || status === 'SOLD_OUT') {
            product.title = title;
            product.content = content;
            product.password = password;
            product.status = status;

            await product.save();
        } else {
            return res
                .status(400)
                .json({ errorMassage: '상품의 상태는 FOR_SALE 또는 SOLD_OUT 이어야 합니다.' });
        }
    }

    return res.status(200).json({ Message: '상품 정보를 수정하였습니다.' });
});

// 상품 삭제
router.delete('/product/:productId', async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { password } = req.body;

        if (!productId || !password) {
            return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
        }

        const product = await Product.findById(productId).exec();

        if (!product) {
            return res.status(404).json({ errorMassage: '상품 조회에 실패하였습니다.' });
        }

        if (product.password !== password) {
            return res.status(401).json({ errorMassage: '상품을 삭제할 권한이 없습니다.' });
        }

        await Product.deleteOne({ _id: productId });

        return res.status(200).json({ Massage: '상품이 삭제되었습니다.' });
    } catch (error) {
        next(error);
    }
});

export default router;
