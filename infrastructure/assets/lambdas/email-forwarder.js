const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const ses = new SESClient({ region: process.env.AWS_REGION });
const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  console.log('Received SES event:', JSON.stringify(event, null, 2));

  try {
    const sesRecord = event.Records[0].ses;
    const messageId = sesRecord.mail.messageId;
    const bucketName = process.env.EMAIL_BUCKET;
    const objectKey = messageId;

    // Get the email content from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey
    });

    const getObjectResponse = await s3.send(getObjectCommand);
    const rawEmail = await getObjectResponse.Body.transformToString();

    // Extract original headers and modify
    const emailLines = rawEmail.split('\\n');
    const bodyStart = emailLines.findIndex(line => line.trim() === '');
    const headers = emailLines.slice(0, bodyStart).join('\\n');
    const body = emailLines.slice(bodyStart).join('\\n');

    // Add forwarding headers
    const forwardingHeaders = [
      'X-Forwarded-By: AWS SES Email Forwarder',
      `X-Original-To: ${sesRecord.mail.commonHeaders.to.join(', ')}`,
      `X-Original-From: ${sesRecord.mail.commonHeaders.from.join(', ')}`,
      `X-Original-Message-ID: ${messageId}`
    ].join('\n');

    const modifiedEmail = forwardingHeaders + '\n' + headers + body;

    // Forward the email
    const sendRawEmailCommand = new SendRawEmailCommand({
      Source: process.env.FROM_EMAIL,
      Destinations: [process.env.TO_EMAIL],
      RawMessage: {
        Data: Buffer.from(modifiedEmail)
      }
    });

    await ses.send(sendRawEmailCommand);

    console.log(`Successfully forwarded email from ${sesRecord.mail.commonHeaders.from.join(', ')} to ${process.env.TO_EMAIL}`);

    return {
      statusCode: 200,
      body: 'Email forwarded successfully'
    };

  } catch (error) {
    console.error('Error forwarding email:', error);
    throw error;
  }
};
