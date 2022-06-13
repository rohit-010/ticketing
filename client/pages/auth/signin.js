import { useState } from "react";
import Router from 'next/router';
import useRequest from "../../hooks/use-request";

export default () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const {doRequest, errors} = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: {
            email,
            password
        },
        onSuccess: () => Router.push('/')
    });

    const emailChangeHandler = event => { 
        setEmail(event.target.value);
    };

    const passwordChangeHandler = event => { 
        setPassword(event.target.value);
    };

    const onSubmit = async(event) => {
        event.preventDefault();
  
       doRequest();
    };

    return (
        <form onSubmit={onSubmit}> 
            <h1>Sign in</h1>
            <div className="form-group">
                <label>Email Address</label>
                <input className="form-control" value={email} onChange={emailChangeHandler}/>
            </div>
            <div className="form-group">
                <label>Password</label>
                <input type="password" className="form-control" value={password} onChange={passwordChangeHandler}/>
            </div>
           {errors}
            <button className="btn btn-primary">Sign in</button>
        </form>
    );
};