const PESAPAL_BASE_URL = process.env.PESAPAL_ENV  === 'live' ? 
'https://www.pesapal.com/API/PostPesapalDirectOrderV4' : 
'https://demo.pesapal.com/API/PostPesapalDirectOrderV4';

export async function getPesapalToken(consumerKey: string, consumerSecret: string)