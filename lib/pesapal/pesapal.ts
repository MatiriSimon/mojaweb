

const PESAPAL_BASE_URL = process.env.PESAPAL_ENV  === 'live'
    ?'https://pay.pesapal.com/v3'
    : 'https://cybqa.pesapal.com/pesapalv3';

export async function getPesapalToken(): Promise<string> {
    
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
             Accept: 'application/json',
        },
        body: JSON.stringify({
            consumer_key: process.env.PESAPAL_CONSUMER_KEY,
            consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
        }),
    })
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to authenticate with Pesapal');
    return data.token;
}

export async function submitOrder(orderDetails: any){
    const token = await getPesapalToken();
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderDetails),
    })
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to submit order to Pesapal');
    return data;
}

export async function getTransactionStatus(orderTrackingId: string) {
    const token = await getPesapalToken();
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
    
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        }
    })

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch transaction status');
    return data;
}