// Netlify Function: Authentication
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE || 'decorator-users';

// Owner credentials (should be in environment variables in production)
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'ramadan.nady1985@gmail.com';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || '01099797984';
const JWT_SECRET = process.env.JWT_SECRET || 'decorator-secret-key-2024';

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { action, email, password } = JSON.parse(event.body || '{}');

        if (action === 'login') {
            // Check if it's the owner
            if (email.toLowerCase() === OWNER_EMAIL.toLowerCase() && password === OWNER_PASSWORD) {
                const token = jwt.sign(
                    { email: OWNER_EMAIL, isOwner: true, name: 'المالك' },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        token,
                        user: {
                            email: OWNER_EMAIL,
                            name: 'المالك',
                            isOwner: true
                        }
                    })
                };
            }

            // Check DynamoDB for other users
            try {
                const result = await dynamoDB.get({
                    TableName: USERS_TABLE,
                    Key: { email: email.toLowerCase() }
                }).promise();

                if (result.Item && result.Item.password === password) {
                    const token = jwt.sign(
                        { email: result.Item.email, isOwner: false, name: result.Item.name },
                        JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            token,
                            user: result.Item
                        })
                    };
                }
            } catch (dbError) {
                // DynamoDB not configured, fallback to localStorage auth
            }

            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' })
            };
        }

        if (action === 'register') {
            // Check if owner email
            if (email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ success: false, error: 'هذا البريد مخصص للمالك' })
                };
            }

            // Save to DynamoDB if available
            try {
                await dynamoDB.put({
                    TableName: USERS_TABLE,
                    Item: {
                        email: email.toLowerCase(),
                        name: name || 'مستخدم',
                        password,
                        isOwner: false,
                        role: 'user',
                        createdAt: new Date().toISOString()
                    },
                    ConditionExpression: 'attribute_not_exists(email)'
                }).promise();
            } catch (dbError) {
                // DynamoDB not configured
            }

            const token = jwt.sign(
                { email: email.toLowerCase(), isOwner: false, name: name || 'مستخدم' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    token,
                    user: { email: email.toLowerCase(), name: name || 'مستخدم', isOwner: false }
                })
            };
        }

        if (action === 'verify') {
            const authHeader = event.headers.authorization;
            if (!authHeader) {
                return { statusCode: 401, headers, body: JSON.stringify({ valid: false }) };
            }

            const token = authHeader.replace('Bearer ', '');
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ valid: true, user: decoded })
                };
            } catch (e) {
                return { statusCode: 401, headers, body: JSON.stringify({ valid: false }) };
            }
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid action' })
        };

    } catch (error) {
        console.error('Auth error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error' })
        };
    }
};
