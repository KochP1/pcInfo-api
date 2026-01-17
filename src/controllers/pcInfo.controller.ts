import { Request, RequestHandler, Response } from "express";
import os, { networkInterfaces } from 'os';
import util from  'util';
import exec from 'child_process';
import { IPcInfo, IPrinter, NetWorkResults } from "../interfaces/pcInfo";

const execPromise = util.promisify(exec.exec);

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

const GetOsPrinter = async (): Promise<IPrinter[] | null>  => {
    const osPlatform = os.platform();
    let printer: IPrinter[] | null;
    try {
        switch(osPlatform) {
            case 'win32':
                printer = await GetWindowsPrinter();
                return printer;
        }

        return null;
    } catch(e) {
        console.error(e);
        return null;
    }
}

const GetWindowsPrinter = async (): Promise<IPrinter[] | null> => {
    try {
        const command = `powershell -Command "Get-WmiObject Win32_Printer | Where-Object {\$_.Default} | Select-Object Name, DriverName, PortName, PrinterStatus, Shared, PrinterType, Location, Comment | ConvertTo-Json"`;

        const { stdout, stderr } = await execPromise(command, {
            timeout: 1000,
            encoding: 'utf8'
        });

        if (stderr) {
            console.log(`Stderr Powershell: ${stderr}` );
            return [];
        }

        if (!stdout || stdout.trim() == '') {
            return [];
        }
        const cleanedOutput = stdout.trim();

        const printerData = JSON.parse(cleanedOutput);

        if (!printerData || (Array.isArray(printerData)) || printerData.length === 0) {
            console.log(printerData);
            console.log('No se encontraron impresoras');
            return [];
        }

        const printer = Array.isArray(printerData) ? printerData[0]: printerData;

        let ip = 'N/A';
            const ipMatch = printer.PortName ? printer.PortName.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/) : null;
            if (ipMatch) {
                ip = ipMatch[1];
            }
            
            let lenguaje = 'N/A';
            if (printer.DriverName) {
                const driverUpper = printer.DriverName.toUpperCase();

                if (driverUpper.match(/POS|RECEIPT|THERMAL|TICKET/)) lenguaje = 'ESC/POS';
                
                else if (driverUpper.match(/ZPL|ZEBRA/)) lenguaje = 'ZPL (Zebra)';
                else if (driverUpper.match(/EPL|ELTRON/)) lenguaje = 'EPL (Eltron)';
                else if (driverUpper.match(/CPCL/)) lenguaje = 'CPCL (Comtec)';
                else if (driverUpper.match(/DPL/)) lenguaje = 'DPL (Datamax)';
                else if (driverUpper.match(/IPL/)) lenguaje = 'IPL (Intermec)';
                else if (driverUpper.match(/KPDL|KYOCERA/)) lenguaje = 'KPDL (Kyocera)';
                else if (driverUpper.match(/LCDS|LEXMARK/)) lenguaje = 'LCDS (Lexmark)';
                else if (driverUpper.match(/SPL|SAMSUNG/)) lenguaje = 'SPL (Samsung)';
                
                else if (driverUpper.match(/PCL[0-9]?/)) lenguaje = 'PCL (HP)';
                else if (driverUpper.match(/POSTSCRIPT|PS\b/)) lenguaje = 'PostScript (Adobe)';
                else if (driverUpper.match(/XPS\b/)) lenguaje = 'XPS (Microsoft)';
                else if (driverUpper.match(/PDF\b/)) lenguaje = 'PDF';
                else if (driverUpper.match(/ONENOTE/)) lenguaje = 'OneNote';
                else if (driverUpper.match(/GDI\b/)) lenguaje = 'GDI (Windows)';
                
                else if (printer.Name && printer.Name.toUpperCase().match(/POS|TERMICA|TICKET|RECIBO/)) {
                    lenguaje = 'ESC/POS (probable)';
                }
            }
            
            let tipo = 'Virtual';
            if (ip !== 'N/A') tipo = 'Red';
            else if (printer.PortName && printer.PortName.match(/^COM|^LPT|^USB/)) tipo = 'Local';
            else if (printer.PortName && printer.PortName.match(/WSD/)) tipo = 'Web Services';
            
            let estado = 'Desconocido';
            if (printer.PrinterStatus === 3) estado = 'Inactivo';
            else if (printer.PrinterStatus === 4) estado = 'Imprimiendo';
            else if (printer.PrinterStatus === 9) estado = 'Listo';

            const printers: IPrinter[] = [];

            printers.push(
                {
                nombre: printer.Name || 'N/A',
                driver: printer.DriverName || 'N/A',
                lenguaje: lenguaje,
                estado: estado,
                trabajosEnCola: 0,
                compartida: printer.Shared || false,
                tipo: tipo,
                tipoDetalle: printer.Type || 'N/A',
                ip: ip,
                puerto: printer.PortName || 'N/A',
                ubicacion: printer.Location || 'N/A',
                comentario: printer.Comment || 'N/A',
                fechaInstalacion: new Date().toISOString(),
                capacidades: ''
                }
            )
            
            return printers;

    } catch(e) {
        console.error(e);
        return null;
    }
}

/* CONTROLLER */
export const GetPcInfo: RequestHandler = async (rew: Request, res: Response) => {
    try {
        const result: IPcInfo = {
            IpResult: GetIp(),
            printer: await GetOsPrinter()
        };

        return res.status(200).json(result);
    } catch(e) {
        console.error(e);
    }
}