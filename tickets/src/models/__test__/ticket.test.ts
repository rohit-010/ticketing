import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async() => {
    // Create an instance of ticket
    const ticket = await Ticket.build({
        title: 'concert',
        price: 20,
        userId: '123'
    });

    // Save the ticket to database
    await ticket.save();

    // Fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // Make two separate changes to the tickets we fetched
    firstInstance!.set({price: 30});
    secondInstance!.set({price: 60});

    // Save the first fetched ticket
    await firstInstance!.save();

    // Save the second fetched ticket and expect an error
   

    try{
        await secondInstance!.save();
    }catch(err){
        return;
    }

    throw new Error('Not expecting this line to execute');
    
    // expect(async() => {
    //     await secondInstance!.save();
    // }).toThrow();
});

it('increments the version on save of record', async() => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 30,
        userId: '123'
    });

    await ticket.save();

    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
})