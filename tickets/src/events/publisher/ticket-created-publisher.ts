import { Subjects, TicketCreatedEvent, Publisher } from "@r0hit-tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}