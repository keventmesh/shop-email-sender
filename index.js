const {CloudEvent} = require('cloudevents');

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
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
    context.log.debug("context", context);
    context.log.debug("event", event);

    const info = await transporter.sendMail({
        from: '"Website Order" <shop-notifications@shop.com>',
        to: "shop-notifications@example.com",
        subject: "New website order ✔",
        html: "<b>Hello world?</b>", // html body
    });


    return new CloudEvent({
        source: 'com.shop.products.order.notifications.email.sender',
        type: 'com.shop.products.order.notifications.email.sent',
        dataschema: event.dataschema,
        datacontenttype: event.datacontenttype,
        data: event.data,
        data_base64: event.data_base64,
        subject: event.subject,
    });
};

module.exports = {handle};
