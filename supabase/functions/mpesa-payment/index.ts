import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, amount } = await req.json();

    console.log('Initiating M-Pesa payment:', { phoneNumber, amount });

    // Get M-Pesa credentials
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
    const passkey = Deno.env.get('MPESA_PASSKEY');
    const shortcode = '174379'; // Sandbox shortcode

    if (!consumerKey || !consumerSecret || !passkey) {
      throw new Error('M-Pesa credentials not configured');
    }

    // Get access token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token request failed:', tokenResponse.status, errorText);
      throw new Error(`Failed to get M-Pesa access token: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Access token obtained');

    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData);
      throw new Error('M-Pesa API did not return an access token');
    }

    const access_token = tokenData.access_token;

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
    // Generate password
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Format phone number (remove + and ensure it starts with 254)
    const formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254');

    // Initiate STK Push
    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(amount),
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: 'https://mydomain.com/callback',
          AccountReference: 'Order Payment',
          TransactionDesc: 'Payment for order',
        }),
      }
    );

    if (!stkResponse.ok) {
      const errorText = await stkResponse.text();
      console.error('STK Push request failed:', stkResponse.status, errorText);
      throw new Error(`M-Pesa STK Push failed: ${stkResponse.status} - ${errorText}`);
    }

    const stkData = await stkResponse.json();
    console.log('STK Push response:', stkData);

    if (stkData.ResponseCode === '0') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment request sent. Please check your phone.',
          checkoutRequestID: stkData.CheckoutRequestID,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(stkData.ResponseDescription || 'Payment initiation failed');
    }
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Payment initiation failed';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
