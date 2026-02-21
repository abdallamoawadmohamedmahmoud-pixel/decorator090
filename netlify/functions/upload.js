// Netlify Function: File Upload
const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME || 'decorator-uploads';

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // Parse the multipart form data manually
        const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
        
        if (!contentType.includes('multipart/form-data')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid content type' })
            };
        }

        // Get the base64 encoded body
        const base64Data = event.body;
        const buffer = Buffer.from(base64Data, 'base64');

        // Extract filename from headers or generate one
        const filename = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Determine content type
        let fileType = 'application/octet-stream';
        if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
            fileType = 'image/jpeg';
        } else if (contentType.includes('image/png')) {
            fileType = 'image/png';
        } else if (contentType.includes('image/webp')) {
            fileType = 'image/webp';
        } else if (contentType.includes('video/mp4')) {
            fileType = 'video/mp4';
        } else if (contentType.includes('video/webm')) {
            fileType = 'video/webm';
        }

        // Try to upload to S3, if not available return a data URL
        try {
            await s3.putObject({
                Bucket: BUCKET_NAME,
                Key: filename,
                Body: buffer,
                ContentType: fileType,
                ACL: 'public-read'
            }).promise();

            const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${filename}`;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    url,
                    filename
                })
            };
        } catch (s3Error) {
            // S3 not configured, return the file as base64 data URL
            const dataUrl = `data:${fileType};base64,${base64Data}`;
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    url: dataUrl,
                    filename,
                    isBase64: true
                })
            };
        }

    } catch (error) {
        console.error('Upload error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Upload failed' })
        };
    }
};
