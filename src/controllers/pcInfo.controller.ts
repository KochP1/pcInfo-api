import { Request, RequestHandler, Response } from "express";
import os, { networkInterfaces } from 'os';
import 'util';
import { IPcInfo, NetWorkResults } from "../interfaces/pcInfo";

// PC INFO CONTROLLER WHERE WE OBTAIN THE DATA FROM THE USER PC AND AS AN ADD-ON THEIR DEFAULT PRINTER IN WINDOWS

/* METHODS */

const GetIp = (): NetWorkResults => {
    // WE OBTAIN THE INTERFACES AND WE INITIALIZE THE RESULT OBJECT
    const nets = networkInterfaces();
    const results: NetWorkResults = {};

    if (!nets) {
        return results;
    }

    // WE ITERATE ON NETWORK INTEFACES
    for (const name of Object.keys(nets)) {
        const netInterfaces = nets[name];

        // WE VERIFY THA IT IS AN ARRAY AND IS NOT NULL
        if (!netInterfaces || !Array.isArray(netInterfaces)) {
            continue;
        }

        // WE ITERATE IN EACH NETWORK CONFIGURATION
        for (const net of netInterfaces) {
            // WE VERIFY THAT NET EXISTS AND THAT IT HAS THE PROPERTIES WE NEED
            if (net.family !== 'IPv4' || net.internal || !net) {
                continue;
            }

            if (!results[name]) {
                results[name] = [];
            }

            // NOW, THAT WE NOW net.address EXISTS, WE PUSHIT TO THE RESULT
            results[name].push(net.address);
        }
    }

    return results;
}

const GetOsPrinter = (): string => {
    const osPlatform = os.platform();

    try {
        switch(osPlatform) {
            case 'win32':
                GetWindowsPrinter();
                return '';
        }

        return '';
    } catch(e) {
        console.error(e);
        return `${e}`
    }
}

const GetWindowsPrinter = () => {

}

/* CONTROLLER */
export const GetPcInfo: RequestHandler = async (rew: Request, res: Response) => {
    try {
        const result: IPcInfo = {
            IpResult: GetIp()
        };

        return res.status(200).json(result);
    } catch(e) {
        console.error(e);
    }
}