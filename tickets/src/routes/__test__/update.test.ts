import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import {natsWrapper} from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns a 404 if the provided id doest not exists', async()=>{
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
        title: 'ticket',
        price: 20
    })
    .expect(404);

});

it('returns a 401 if the user is not authenticated', async()=>{
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
    .put(`/api/tickets/${id}`)
    .send({
        title: 'ticket',
        price: 20
    })
    .expect(401);

});

it('returns a 401 if the user does not own a ticket', async ()=>{

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'ticket',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'new-title',
            price: 30
        })
        .expect(401);

});

it('returns a 400 if the user provides invalid title or price', async ()=>{
    const cookie = global.signin();
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'ticket',
        price: 20
    });

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'',
        price: 20
    })
    .expect(400);

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
        title:'title updated',
        price: -120
    })
    .expect(400);


});

it('updated the ticket provided valid inputs', async ()=>{

    const cookie = global.signin();
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'ticket',
        price: 20
    });

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie',cookie)
    .send({
        title: 'new title',
        price: 300
    })
    .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual('new title');
    expect(ticketResponse.body.price).toEqual(300);

});

it('pubslishes an event after updating ticket', async() => {
    const cookie = global.signin();
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'ticket',
        price: 20
    });

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie',cookie)
    .send({
        title: 'new title',
        price: 300
    })
    .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
    expect(natsWrapper.client.publish).toHaveBeenCalledWith(
        'ticket:updated', expect.any(String), expect.any(Function)
     )
});

it('cannot edit already reserved ticket', async() => {
    const cookie = global.signin();
    const {body:ticketBody} = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
        title: 'ticket',
        price: 20
    });

    const ticket = await Ticket.findById(ticketBody.id);
    ticket?.set({orderId: new mongoose.Types.ObjectId().toHexString()});
    await ticket?.save();

    await request(app)
    .put(`/api/tickets/${ticketBody.id}`)
    .set('Cookie',cookie)
    .send({
        title: 'new title',
        price: 300
    })
    .expect(500);
});