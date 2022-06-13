import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import {Order} from '../../models/order';
import { OrderStatus } from '@r0hit-tickets/common';
import {stripe} from '../../stripe-wrapper';
import {Payment} from '../../models/payment';

//jest.mock('../../stripe-wrapper');
jest.setTimeout(5000*100);

it('returns a 404 when purchasing an order that does not exist', async() => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: '121',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to user', async() => {

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 10,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: '121',
        orderId: order.id
    })
    .expect(401);
});

it('returns a 500 when purchasing a cancelled order', async() => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 10,
        status: OrderStatus.Cancelled        
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: '1',
            orderId: order.id
        })
        .expect(500);
});

it('returns a 204 with valid inputs',async() => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price,
        status: OrderStatus.Created        
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);
    
    const stripeCharges = await stripe.paymentIntents.list({limit: 50});
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.amount).toEqual(price * 100);

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    });

    expect(payment).not.toBeNull();

    // const chargeOptions = (stripe.paymentIntents.create as jest.Mock).mock.calls[0][0];
    // expect(chargeOptions.payment_method_types).toEqual(['card']);
    // expect(chargeOptions.amount).toEqual(10*100);
    // expect(chargeOptions.currency).toEqual('usd');
});