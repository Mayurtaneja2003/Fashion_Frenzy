import React, { useState } from 'react'
import './NewsLetter.css'

const NewsLetter = () => {
    const [email, setEmail] = useState('');
    const [subscriptionStatus, setSubscriptionStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setSubscriptionStatus('Please enter an email address');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            
            if (data.success) {
                setSubscriptionStatus('Thank you for subscribing!');
                setEmail('');
            } else {
                setSubscriptionStatus(data.message);
            }
        } catch (error) {
            setSubscriptionStatus('Something went wrong. Please try again.');
        }
    };

    return (
        <div className='newsletter'>
            <h1>Get Exclusive Offers On Your Email</h1>
            <p>Subscribe to our newsletter and stay updated</p>
            <form onSubmit={handleSubmit}>
                <div className="newsletter-input">
                    <input 
                        type="email" 
                        placeholder='Your Email id' 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit">Subscribe</button>
                </div>
            </form>
            {subscriptionStatus && (
                <p className={`subscription-status ${subscriptionStatus.includes('Thank you') ? 'success' : 'error'}`}>
                    {subscriptionStatus}
                </p>
            )}
        </div>
    )
}

export default NewsLetter
