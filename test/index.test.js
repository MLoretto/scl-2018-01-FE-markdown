const sum = require('../index.js');

describe(
    'Verifica si ingresa argumento',
    () => {
    test('Verificar si ingresa ruta', ()=> {
        expect(verifyEntryPath('/Mi/Ruta/Falsa')).toBeTruthy();
    });

    test('Verificar mensaje de error si no ingresa Ruta', ()=> {
        expect(verifyEntryPath('')).toEqual('Tiene ingresar el path a revisar.');
    });
});

describe(
    'Verifica si es Directorio',
    () => {

    test('Si, es un directorio',()=>{
        expect(verifyDirectory('rutafalsa/rutafalsa')).toBeTruthy();
    });

    test('No es directorio',()=>{
        expect(verifyDirectory('rutafalsa/archivofalso.txt')).toBeFalsy();
    });
});

describe(
    'Verifica si es archivo',
    () => {

    test('Si, es un archivo',()=>{
        expect(verifyArchivo('archivofalso.falso')).toBeTruthy();
    });

    test('No es archivo',()=>{
        expect(verifyArchivo('rutafalsa/archivofalso')).toBeFalsy();
    });
});

describe(
    'Verifica si archivo es md',
    () => {
        test('Si es Archivo .md',()=>{
            expect(verifyMd('archivofalso.md')).toBeTruthy();
        });
    
        test('No es Archivo .md',()=>{
            expect(verifyMd('archivofalso.txt')).toBeFalsy();
        });
});

describe(
    'Verifica si recorre y muestra links',
    () => {
    test('Retorna arreglo vacío si no encuentra links', () => {
        expect.assertions(1);
        return mdLinks.mdLinks('./Ultrafalsa/archivofalso.md').then(arrayData => expect(arrayData).toEqual([]));
    });

    test('Retorna arreglo con objeto que contiene links, texto, path y línea', () => {
        expect.assertions(4);
        return mdLinks.mdLinks('./rutafalsa/archivofalso.md').then(arrayData => {
            let linksData = arrayData[0];
            expect(linksData.href).toEqual('http://webfalsa.com');
            expect(linksData.line).toEqual('666');
            expect(linksData.text).toEqual('link falso');
            expect(linksData.path).toEqual('./rutafalsa/archivofalso.md');
        });
    });
});

