const PESAPAL_BASE_URL = process.env.PESAPAL_ENV  === 'live'
    ?'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

export async function getPesapalToken(): Promise<string> {
    
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/Request token`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'accept': 'application/json',
        },
        body: JSON.stringify({
            consumer_key: process.env.PESAPAL_CONSUMER_KEY,
            consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
        }),
    })
    const data = await response.json();
    return data.token;
}
