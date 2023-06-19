/* eslint-disable */

//Frontend Integration-- update on another application kindly check

const Stripe = require('stripe');

const stripe = Stripe(
  'sk_test_51N2dv9BFw2p3fKIl5mKN5A4eldF6evPa4vLqrSDHq1fKpejNY8pI8RUxiBW6sQeGfBKiOlzoJCa0wABjkdf4XKPI001jRggSCM'
);

const bookTour = async (tourId) => {
  try {
    //1 Get checkout session from API

    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    //2 Create checkout form + charge credit card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {}
};
