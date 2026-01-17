export interface NetWorkResults {
    [key: string]: string[];
}

export interface IPrinter {
    nombre: string;
    driver: string;
    lenguaje: string;
    estado: string;
    trabajosEnCola: number;
    compartida: string;
    tipo: string;
    tipoDetalle: string;
    ip: string;
    puerto: string;
    ubicacion: string;
    comentario: string;
    fechaInstalacion: string;
    capacidades: string;
}

export interface IPcInfo {
    IpResult: NetWorkResults
    printer?: IPrinter[] | null
}