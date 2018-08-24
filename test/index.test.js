const mdLinks = require('../index.js');
const path = require('path');

describe(
    'Verifica si ingresa argumento',
    () => {
    test('Verificar si ingresa ruta', ()=> {
        expect(mdLinks.verifyEntryPath('/Mi/Ruta/Falsa')).toBeTruthy();
    });

    test('Verificar mensaje de error si no ingresa Ruta', ()=> {
        expect(mdLinks.verifyEntryPath('')).toEqual('Tiene ingresar el path a revisar.');
    });
});

describe(
    'Verifica si convierte a ruta absoluta una ruta relativa',
    () => {
    test('Si, es ruta absoluta', ()=> {
        expect(mdLinks.convertToAbsolutePath('/Mi/Ruta/Falsa')).toEqual('/Mi/Ruta/Falsa');
    });

    test('No, se convierte a ruta absoluta', ()=> {
        let workingPath = path.resolve('');
        expect(mdLinks.convertToAbsolutePath('Mi/Ruta/Falsa')).toEqual(`${workingPath}/Mi/Ruta/Falsa`);
    });
});

describe(
    'Verifica si es Directorio',
    () => {

    test('Si, es un directorio',()=>{
        expect(mdLinks.verifyDirectory('rutafalsa/rutafalsa')).toBeTruthy();
    });

    test('No es directorio',()=>{
        expect(mdLinks.verifyDirectory('rutafalsa/archivofalso.txt')).toBeFalsy();
    });
});

describe(
    'Verifica si es archivo',
    () => {

    test('Si, es un archivo',()=>{
        expect(mdLinks.verifyArchivo('archivofalso.falso')).toBeTruthy();
    });

    test('No es archivo',()=>{
        expect(mdLinks.verifyArchivo('rutafalsa/archivofalso')).toBeFalsy();
    });
});

describe(
    'Verifica si archivo es md',
    () => {
        test('Si es Archivo .md',()=>{
            expect(mdLinks.verifyMd('archivofalso.md')).toBeTruthy();
        });
    
        test('No es Archivo .md',()=>{
            expect(mdLinks.verifyMd('archivofalso.txt')).toBeFalsy();
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


