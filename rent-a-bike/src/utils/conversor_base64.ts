export class ConversorBase64{
    
    static async arquivoParaDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject("Erro ao ler o arquivo");
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
    }

    static extrairBase64DeDataURL(dataURL: string): string {
        const base64 = 'base64,';
        const index = ( dataURL || '' ).indexOf( base64 );
        if ( index < 0 ) {
            return dataURL;
        }
        return dataURL.substring( index + base64.length );
    }
}