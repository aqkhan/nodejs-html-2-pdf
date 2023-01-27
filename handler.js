const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const puppeteer = require("puppeteer");

exports.handler = async (event, context) => {
  try {
    // Get the URL from the request
    const url = event.queryStringParameters.url;

    // Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url);

    // Convert the page to a PDF
    const pdf = await page.pdf({ format: "A4" });

    // Generate a unique filename for the PDF
    const key = `pdfs/${Date.now()}.pdf`;

    // Upload the PDF to the S3 bucket
    await s3
      .putObject({
        Bucket: "my-bucket",
        Key: key,
        Body: pdf,
        ContentType: "application/pdf",
      })
      .promise();

    // Close the browser
    await browser.close();

    // Return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "PDF created and stored on S3",
        pdfUrl: `https://my-bucket.s3.amazonaws.com/${key}`,
      }),
    };
  } catch (err) {
    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error creating PDF",
        error: err,
      }),
    };
  }
};
