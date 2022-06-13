import {Message} from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from "@r0hit-tickets/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publisher/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message){
        // Find the ticket that order is serving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket, throw error
        if(!ticket){
            throw new Error('Ticket not found!');
        }

        // Mark the ticket as reserved by setting its orderId property
        ticket.set({orderId: data.id});

        // Save the ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
           id: ticket.id,
           price: ticket.price,
           title: ticket.title,
           userId: ticket.userId,
           version: ticket.version,
           orderId: ticket.orderId
        });

        // Ack the message
        msg.ack();
    }

}