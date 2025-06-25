import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './StripePayment.css';

const StripePayment = ({ amount, onSuccess, onError, customerInfo }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents page refresh!

        if (!stripe || !elements || !customerInfo) {
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);

        try {
            if (!customerInfo.email) {
                setPaymentError('Please enter your email address.');
                setIsProcessing(false);
                return;
            }

            // Create payment intent
            const response = await fetch('http://localhost:4000/api/orders/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({
                    amount: amount,
                    email: customerInfo.email // <-- Make sure this is NOT empty!
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret } = await response.json();

            // Confirm card payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                        email: customerInfo.email,
                        address: {
                            line1: customerInfo.address,
                            city: customerInfo.city,
                            state: customerInfo.state,
                            postal_code: customerInfo.zipCode
                        }
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (result.paymentIntent.status === 'succeeded') {
                onSuccess(result.paymentIntent);
            }
        } catch (error) {
            console.error('Payment error:', error);
            setPaymentError(error.message);
            onError(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-form">
            <div className="card-element-container">
                <CardElement 
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>
            {paymentError && (
                <div className="payment-error">
                    {paymentError}
                </div>
            )}
            <button 
                type="submit" 
                disabled={!stripe || isProcessing} 
                className="stripe-submit-button"
            >
                {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </button>
        </form>
    );
};

export default StripePayment;