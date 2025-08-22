import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import ApiRoutes from './Routes/index.js';
import AppConfig from './Config/AppConfig.js';
import logger from './Config/logger.js';
import connectToDB from './Config/db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan('tiny'));

AppConfig.RateLimiter(app);

connectToDB();

app.use('/api', ApiRoutes);

app.listen(AppConfig.PORT, () => {
  logger.success(`Server is running on port ${AppConfig.PORT}`);
});