import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedEvent } from "@r0hit-tickets/common";
import {Message} from 'node-nats-streaming';
import mongoose from "mongoose";

const setup = async () => {
    // Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    });

    await ticket.save();

    // Create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'concert updated',
        price: 20,
        userId: 'HellGame'
    };

    // Create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    // return all of this stuff
    return {listener, data, msg, ticket};
};

it('finds, updates and saves the ticket', async() =>{
    const {listener,data,msg, ticket} = await setup();

    await listener.onMessage(data,msg);

    const updateTicket = await Ticket.findById(ticket.id);

    expect(updateTicket!.title).toEqual(data.title);
    expect(updateTicket!.price).toEqual(data.price);
    expect(updateTicket!.version).toEqual(data.version);
});

it('acks the message', async() => {
    const {listener,msg,data} = await setup();

    await listener.onMessage(data,msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if version is out of order', async() => {
    const {listener, data, msg} = await setup();

    data.version = 99;

    try{
        await listener.onMessage(data,msg);
    }catch(err){

    }

    expect(msg.ack).not.toHaveBeenCalled();
});