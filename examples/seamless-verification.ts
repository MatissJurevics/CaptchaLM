
import express from 'express';
import { createExpressMiddleware } from '../src/index'; // Importing from source for local test
import { createServer } from 'http';
import { AddressInfo } from 'net';

// 1. Setup Server
const app = express();
app.use(express.json());

const { protect, challenge: challengeHandler } = createExpressMiddleware({
    secret: 'test-secret-key-12345',
    difficulty: 'easy', // Keep it easy for the test
    challengeTypes: ['chained_operations'] // Force specific type for predictable solving in this test
});

app.get('/challenge', challengeHandler);

app.post('/protected', protect, (req, res) => {
    res.json({ secret_data: "Success! You are verified." });
});

const server = createServer(app);

// 2. Client "AI Agent" Simulation
async function runAgentSimulation(baseUrl: string) {
    console.log('🤖 Agent: Attempting to access protected resource...');

    // Step 1: Request without credentials
    const initialRes = await fetch(`${baseUrl}/protected`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: 'request-1' })
    });

    console.log(`\n📨 Server Response: ${initialRes.status} ${initialRes.statusText}`);

    if (initialRes.status === 200) {
        console.error('❌ Error: Protected resource accepted request without verification!');
        return;
    }

    if (initialRes.status !== 401) {
        console.error('❌ Error: Expected 401, got', initialRes.status);
        return;
    }

    const errorBody = await initialRes.json();
    console.log('📦 Body:', JSON.stringify(errorBody, null, 2));

    const { uncaptcha } = errorBody;
    if (!uncaptcha || !uncaptcha.instructions) {
        console.error('❌ Error: Response missing seamless flow instructions');
        return;
    }

    console.log('\n👀 Agent: I see instructions! Reading them...');
    console.log('---------------------------------------------------');
    console.log(uncaptcha.instructions);
    console.log('---------------------------------------------------');

    // Step 2: "Solve" the challenge
    // In a real scenario, the LLM reads the text. Here, we'll cheat slightly and use the payload 
    // because writing a regex parser for the text instructions in this test script is overkill.
    // BUT we are proving the flow works.

    console.log('\n🧠 Agent: Solving challenge...');

    const payload = uncaptcha.challenge.payload;
    let answer: string = "";

    if (uncaptcha.challenge.type === 'chained_operations') {
        let val = payload.initialValue;
        for (const op of payload.operations) {
            switch (op.operation) {
                case 'add': val += op.value; break;
                case 'subtract': val -= op.value; break;
                case 'multiply': val *= op.value; break;
                // ... handle others if needed for 'easy' difficulty
            }
        }
        // Easy difficulty uses plain encoding usually, or we check responseEncoding
        if (payload.responseEncoding === 'base64') {
            answer = Buffer.from(val.toString()).toString('base64');
        } else {
            answer = val.toString();
        }
        console.log(`   Calculated: ${val} -> Encoded: ${answer}`);
    } else {
        console.log('   (Test script only implements chained_operations solver)');
    }

    // Step 3: Retry with solution
    console.log('\n🚀 Agent: Retrying request with solution...');

    const headers = {
        'Content-Type': 'application/json',
        ...uncaptcha.howToSubmit.headers
    };
    // Replace placeholder
    headers['x-uncaptcha-solution'] = answer;

    const body = {
        data: 'request-1',
        ...uncaptcha.howToSubmit.body
    };

    const finalRes = await fetch(`${baseUrl}/protected`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    console.log(`\n📨 Server Response: ${finalRes.status} ${finalRes.statusText}`);

    if (finalRes.status === 200) {
        const finalData = await finalRes.json();
        console.log('🎉 Success! Data:', finalData);
    } else {
        const text = await finalRes.text();
        console.error('❌ Failed:', text);
    }
}

// Start server and run test
server.listen(0, () => {
    const addr = server.address() as AddressInfo;
    const port = addr.port;
    console.log(`Server running on port ${port}`);

    runAgentSimulation(`http://localhost:${port}`).then(() => {
        server.close();
        process.exit(0);
    }).catch(err => {
        console.error(err);
        server.close();
        process.exit(1);
    });
});
