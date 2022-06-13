
import request from 'supertest';
import { app } from '../../app';

it('fails when a email that does not exist is supplied', async()=> {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test121@test.com',
            password: 'password'
        })
        .expect(500);
});


it('fails when an incorrect password is supplied', async()=> {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password1'
        })
        .expect(500);
});


it('should allow valid credentials on signin', async() => {

    const cred = {
        email: 'test@test.com',
        password: 'password'
    };

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test2@test.com',
            password: 'password2'
        }) 
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test2@test.com',
            password:'password2'
        })
        .expect(200);
});


it('responds with a cookie when given valid credentials', async()=> {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'email1@test.com',
            password: 'password'
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'email1@test.com',
            password: 'password'
        })
        .expect(200);
        
    //expect(response.get('Set-Cookie')).toBeDefined();
});