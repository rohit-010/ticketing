import { Subjects, OrderCreatedEvent, Publisher } from "@r0hit-tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    readonly subject = Subjects.OrderCreated;
}

