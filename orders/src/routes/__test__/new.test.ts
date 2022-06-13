import request from 'supertest';
import mongoose from 'mongoose';
import {app} from '../../app';
import {Order, OrderStatus} from '../../models/order';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async() => {
    const ticketId =  new mongoose.Types.ObjectId().toHexString();
    
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(404)
});

it('returns an error if ticket is already reserved', async() => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const order = Order.build({
        userId: '12312',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    });

    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(500);
});

it('reserves a ticket', async() => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201);

    //console.log(response);
    expect(response.body.ticket.title).toEqual('concert');
    expect(response.body.ticket.price).toEqual(20);
});

it('emits an order created event', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201);
    
    expect(natsWrapper.client.publish).toHaveBeenCalledWith('order:created', expect.any(String)
    ,expect.any(Function));
});