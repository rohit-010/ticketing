import { Subjects, PaymentCreatedEvent, Publisher } from "@r0hit-tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}