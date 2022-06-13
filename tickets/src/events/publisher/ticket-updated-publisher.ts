import { Subjects, TicketUpdatedEvent, Publisher } from "@r0hit-tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    readonly subject = Subjects.TicketUpdated;
}