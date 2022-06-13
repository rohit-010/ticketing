import { Message } from "node-nats-streaming";
import { Listener, Subjects, OrderCreatedEvent } from "@r0hit-tickets/common";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message){
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log('Before processing job waiting for time:',delay);
        await expirationQueue.add({
            orderId: data.id
        },{
            delay,
        });

        msg.ack();
    }
}