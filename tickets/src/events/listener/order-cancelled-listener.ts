import {Message} from 'node-nats-streaming';
import { Listener, OrderCancelledEvent, Subjects } from "@r0hit-tickets/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publisher/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if(!ticket){
            throw new Error('Ticket not found!');
        }
        // sometime typescript dont work well with null so setting undefined
        ticket.set({orderId: undefined});
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });

        msg.ack();
    }
}