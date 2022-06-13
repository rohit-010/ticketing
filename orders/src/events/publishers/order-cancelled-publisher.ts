import { Subjects, OrderCancelledEvent, Publisher } from "@r0hit-tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}