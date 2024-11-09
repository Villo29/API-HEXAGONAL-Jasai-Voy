
export const errorHandler = (err: { stack: any; }, req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; }, next: any) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
};
