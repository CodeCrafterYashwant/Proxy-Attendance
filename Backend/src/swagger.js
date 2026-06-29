import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'My API',
    description: 'Description'
  },
  host: 'temp-zw0w.onrender.com'
};

const outputFile = './swagger.json';
const routes = [`./routes/user.routes.js`, `./routes/attendence.routes.js`];
swaggerAutogen(outputFile, routes, doc)
