import { Subjects, Publisher, ExpirationCompleteEvent } from "@r0hit-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    readonly subject = Subjects.ExpirationComplete;
};