import express from 'express';
import { GetPcInfo } from '../controllers/pcInfo.controller';
export const pcInfoRouter = express.Router();

pcInfoRouter.get('/PcInfo', GetPcInfo);