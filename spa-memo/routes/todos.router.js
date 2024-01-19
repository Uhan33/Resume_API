// routes/todos.router.js

import express from 'express';
import joi from 'joi';
import Todo from '../schemas/todo.schema.js';

const router = express.Router();

const createdTodoSchema = joi.object({
    value: joi.string().min(1).max(50).required(), // string타입의 최소 1글자 최대 50글자이며 필수로 존재해야한다.
});

router.post('/todos', async (req, res, next) => {
    try {
        // 클라이언트에게 전달받은 value 데이터를 변수에 저장합니다.
        const validation = await createdTodoSchema.validateAsync(req.body);

        const { value } = validation;

        // 만약 클라이언트가 value 데이터를 전달하지 않았을 때, 클라이언트에게 에러 메시지를 전달한다.
        if (!value) {
            return res.status(400).json({
                errorMassage: '해야할 일(value) 데이터가 존재하지 않습니다.',
            });
        }

        // Todo모델을 사용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
        // findOne = 1개의 데이터만 조회한다.
        // sort = 정렬한다. -를 붙이면 내림차순 안붙이면 오름차순
        const todoMaxOrder = await Todo.findOne().sort('-order').exec(); // exec()를 붙이지 않으면 promise로 동작하지 않는다. 그러면 await를 못씀

        // 'order' 값이 가장 높은 도큐멘트의 1을 추가하거나 없다면, 1을 할당합니다.
        const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

        // Todo모델을 이용해, 새로운 '해야할 일'을 생성합니다.
        const todo = new Todo({ value, order });

        // 생성한 '해야할 일'을 MongoDB에 저장합니다.
        await todo.save();

        return res.status(201).json({ todo: todo });
    } catch (error) {
        // Router 다음에 있는 에러 처리 미들웨어를 진행한다.
        next(error);
    }
});

/* 해야할 일 목록 조회 API */
router.get('/todos', async (req, res, next) => {
    // Todo모델을 이용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
    const todos = await Todo.find().sort('-order').exec();

    // 찾은 '해야할 일'을 클라이언트에게 전달합니다.
    return res.status(200).json({ todos });
});

/** 해야할 일 순서 변경, 완료 / 해제, 수정 API */
router.patch('/todos/:todoId', async (req, res, next) => {
    const { todoId } = req.params;
    const { order, value, done } = req.body;

    // 현재 나의 order가 무엇인지 알아야 한다.
    const currentTodo = await Todo.findById(todoId).exec();
    if (!currentTodo) {
        return res
            .status(400)
            .json({ errorMassage: '존재하지 않는 해야할 일 입니다.' });
    }

    if (order) {
        const targetTodo = await Todo.findOne({ order }).exec();
        if (targetTodo) {
            targetTodo.order = currentTodo.order;
            await targetTodo.save();
        }

        currentTodo.order = order;
    }
    if (done !== undefined) {
        currentTodo.doneAt = done ? new Date() : null;
    }

    if (value) {
        currentTodo.value = value;
    }

    await currentTodo.save();

    return res.status(200).json({});
});

/** 해야할 일 삭제 API */
router.delete('/todos/:todoId', async (req, res, next) => {
    const { todoId } = req.params;

    const todo = await Todo.findById(todoId).exec();
    if (!todo) {
        return res
            .status(404)
            .json({ errorMassage: '존재하지 않는 할 일 정보입니다.' });
    }

    await Todo.deleteOne({ _id: todoId });

    return res.status(200).json({});
});

export default router;
