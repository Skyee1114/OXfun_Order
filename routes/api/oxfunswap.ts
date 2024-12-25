import { Router, Request, Response, NextFunction } from 'express';
import CryptoJS from 'crypto-js';
import { OXFUN_API_URL, OXFUN_API_KEY, OXFUN_API_SECRET } from '../../config';
const router: Router = Router();

interface SwapRequestBody {
    outputToken: string;
    amount: number;     
    // price: number; 
}

const getIsoTimestamp = (): string => {
    return new Date().toISOString();
};
  
const createSignature = (
    timestamp: string,
    nonce: number,
    url: string,
    method: string,
    body: string
  ): string => {
    const msgString = `${timestamp}\n${nonce}\nPOST\n${url}\n${method}\n${body}`;    
    const hmac = CryptoJS.HmacSHA256(msgString, OXFUN_API_SECRET);
    const signature = CryptoJS.enc.Base64.stringify(hmac);
    
    return signature;
};

router.post(
    '/',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            
            const { outputToken, amount } = req.body as SwapRequestBody;

            if (!outputToken || !amount) {
                res.status(400).json({ 
                    error: 'Missing required fields: outputToken, amount, price' 
                });
                return; 
            }
            console.log('Output: ', outputToken);
            console.log('Amount: ', amount);
            // console.log('Price: ', price);

            const marketCode = `${outputToken}-USD-SWAP-LIN`;
            const timestamp = getIsoTimestamp();
            const nonce = 123;
            const method = '/v3/orders/place';   
            const url = 'api.ox.fun'; 
            const requestBody = {
                "responseType": "FULL",
                "timestamp": Date.now(),
                "orders": [
                    {
                        "clientOrderId": Date.now(), 
                        "marketCode": marketCode, 
                        "side": "BUY", 
                        "quantity": amount, 
                        "orderType": "MARKET"
                    }
                ]
            }
            const body = JSON.stringify(requestBody);
            const signature: string = createSignature(timestamp, nonce, url, method, body);
            const response = await fetch(`${OXFUN_API_URL}${method}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'AccessKey': OXFUN_API_KEY,
                    'Timestamp': timestamp,
                    'Signature': signature,
                    'Nonce': nonce.toString()
                },
                body: body
            })

            const jsonResponse = await response.json();
            console.log('Response: ', jsonResponse);

            res.status(200).json({ 
                message: `success` 
            });
            
           
        } catch (err: any) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to swap' });
        }
    }
)

export default router;
