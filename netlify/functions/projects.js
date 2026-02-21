// Netlify Function: Projects Management
const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const PROJECTS_TABLE = process.env.PROJECTS_TABLE || 'decorator-projects';
const BUCKET_NAME = process.env.BUCKET_NAME || 'decorator-uploads';

// Simple in-memory storage for when DynamoDB is not configured
let inMemoryProjects = [];

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const method = event.httpMethod;
        const path = event.path || '/';

        // Get all projects
        if (method === 'GET') {
            try {
                const result = await dynamoDB.scan({ TableName: PROJECTS_TABLE }).promise();
                const projects = result.Items || [];
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(projects)
                };
            } catch (e) {
                // Return in-memory projects
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(inMemoryProjects)
                };
            }
        }

        // Create project
        if (method === 'POST') {
            const project = JSON.parse(event.body);
            project.id = Date.now().toString();
            project.createdAt = new Date().toISOString();

            try {
                await dynamoDB.put({
                    TableName: PROJECTS_TABLE,
                    Item: project
                }).promise();
            } catch (e) {
                // Save to in-memory
                inMemoryProjects.unshift(project);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, project })
            };
        }

        // Update project
        if (method === 'PUT') {
            const { id, ...updates } = JSON.parse(event.body);
            updates.updatedAt = new Date().toISOString();

            try {
                const result = await dynamoDB.update({
                    TableName: PROJECTS_TABLE,
                    Key: { id },
                    UpdateExpression: 'SET #data = :data',
                    ExpressionAttributeNames: { '#data': 'data' },
                    ExpressionAttributeValues: { ':data': updates },
                    ReturnValues: 'ALL_NEW'
                }).promise();

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, project: result.Attributes })
                };
            } catch (e) {
                // Update in-memory
                const index = inMemoryProjects.findIndex(p => p.id === id);
                if (index !== -1) {
                    inMemoryProjects[index] = { ...inMemoryProjects[index], ...updates };
                }
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true })
                };
            }
        }

        // Delete project
        if (method === 'DELETE') {
            const { id } = JSON.parse(event.body);

            try {
                await dynamoDB.delete({
                    TableName: PROJECTS_TABLE,
                    Key: { id }
                }).promise();
            } catch (e) {
                // Delete from in-memory
                inMemoryProjects = inMemoryProjects.filter(p => p.id !== id);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid method' })
        };

    } catch (error) {
        console.error('Projects error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error' })
        };
    }
};
