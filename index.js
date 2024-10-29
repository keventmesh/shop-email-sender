const {CloudEvent} = require('cloudevents');

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'mailpit.event-discovery.svc',
    port: 1025,
    secure: false, // true for port 465, false for other ports
    auth: {},
});

/**
 * Your CloudEvent handling function, invoked with each request.
 * This example function logs its input, and responds with a CloudEvent
 * which echoes the incoming event data
 *
 * It can be invoked with 'func invoke'
 * It can be tested with 'npm test'
 *
 * @param {Context} context a context object.
 * @param {object} context.body the request body if any
 * @param {object} context.query the query string deserialzed as an object, if any
 * @param {object} context.log logging object with methods for 'info', 'warn', 'error', etc.
 * @param {object} context.headers the HTTP request headers
 * @param {string} context.method the HTTP request method
 * @param {string} context.httpVersion the HTTP protocol version
 * See: https://github.com/knative/func/blob/main/docs/function-developers/nodejs.md#the-context-object
 * @param {CloudEvent} event the CloudEvent
 */
const handle = async (context, event) => {
    context.log.info(event);

    const orderData = event.data;

    const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Summary</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        h2 {
            color: #555;
            margin-bottom: 10px;
        }
        .order-details, .customer-details, .payment-details {
            margin-bottom: 20px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .total {
            font-weight: bold;
            font-size: 1.2em;
            color: #333;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Order Summary</h1>

        <div class="order-details">
            <h2>Order ID: ${orderData.orderId}</h2>
            <p>Date: ${orderData.orderDate}</p>
        </div>

        <div class="customer-details">
            <h2>Customer Details</h2>
            <p>Name: ${orderData.customer.name}</p>
            <p>Email: ${orderData.customer.email}</p>
        </div>

        <div class="order-items">
            <h2>Order Items</h2>
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderData.orderItems.map(item => `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.price.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="total">Total Amount: $${orderData.totalAmount.toFixed(2)}</p>
        </div>

        <div class="payment-details">
            <h2>Payment Details</h2>
            <p>Payment Method: ${orderData.payment.method}</p>
            <p>Transaction ID: ${orderData.payment.transactionId}</p>
        </div>
    </div>
</body>
</html>
`;

    const info = await transporter.sendMail({
        from: '"Website Order" <shop-notifications@shop.com>',
        to: "shop-notifications@example.com",
        subject: `New website order ✔ (${orderData.customer.name} - ${orderData.customer.email})`,
        html: emailTemplate,
    });
    console.log("Sent email", "info", info);

    return new CloudEvent({
        source: 'com.shop.products.order.notifications.email.sender',
        type: 'com.shop.products.order.notifications.email.sent',
        dataschema: event.dataschema,
        data: event.data,
    });
};

module.exports = {handle};
