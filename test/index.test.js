const mdLinks = require('../index.js');
const path = require('path');

describe(
    'Verifica si ingresa argumento',
    () => {
    test('Verificar si ingresa ruta', ()=> {
        expect(mdLinks.verifyEntryPath('README.md')).toBeTruthy();
    });

    test('Verificar mensaje de error si no ingresa Ruta', ()=> {
        expect(mdLinks.verifyEntryPath('')).toBeFalsy();
    });
});

describe(
    'Verifica si convierte a ruta absoluta una ruta relativa',
    () => {
    test('Si, es ruta absoluta', ()=> {
        let workingPath = path.resolve('');
        expect(mdLinks.convertToAbsolutePath(`Mi/Ruta/Falsa`)).toEqual(`${path.join(workingPath,'Mi','Ruta','Falsa')}`);
    });

    test('No, se convierte a ruta absoluta', ()=> {
        let workingPath = path.resolve('');
        expect(mdLinks.convertToAbsolutePath('Mi/Ruta/Falsa')).toEqual(`${path.join(workingPath,'Mi','Ruta','Falsa')}`);
    });
});

describe(
    'lista los archivos de un path recursivo',
    () => {
    test('Retorna arreglo con los links de cada archivo recursivo', () => {
        //expect.assertions(1);
		let arrayData = [];
		mdLinks.getDirectoryList('node_modules/abab', arrayData);
		expect(arrayData[0]).toEqual(path.join('node_modules','abab','CHANGELOG.md'));
    });
});

describe(
	'Verifica si ha ingresado un path o archivo valido', () =>{
		test('Retorna verdadero si es un directorio', () => {
			expect(mdLinks.verifyEntryPath(path.join('node_modules','abab'))).toBeTruthy();
		});
		test('Retorna verdadero si es un archivo', () => {
			expect(mdLinks.verifyEntryPath('README.md')).toBeTruthy();
		});
		test('Retorna false si no es algo valido', () => {
			expect(mdLinks.verifyEntryPath('coso')).toBeFalsy();
		});
	});



describe(
    'Verifica si es url',
    () => {

    test('si esta ok',()=>{
		let obj = [{href:'https://github.com/jsdom/abab/pull/26'}];
		expect.assertions(1);
        return mdLinks.validateUrl(obj).then(result => expect(result[0].valid).toEqual('ok 200'));
    });

    test('si esta fail',()=>{
		let obj = [{href:'http://MLoretto.cl'}];
		expect.assertions(1);
        return mdLinks.validateUrl(obj).then(result => expect(result[0].valid).toEqual('fail ENOTFOUND'));		
    });
});


describe(
    'Verifica si recorre y muestra links',
    () => {
    test('Retorna arreglo vacío si no encuentra links', () => {
        expect.assertions(1);
        return mdLinks.mdLinks('RADMEE.md').then(arrayData => expect(arrayData).toEqual([]));
    });

    test('Retorna arreglo con objeto que contiene links, texto, path y línea', () => {
        expect.assertions(4);
        return mdLinks.mdLinks('node_modules/abab/README.md').then(arrayData => {
            expect(arrayData[0][0].href).toEqual('https://badge.fury.io/js/abab.svg');
            expect(arrayData[0][0].linea).toEqual(0);
            expect(arrayData[0][0].text).toEqual('npm version');
            expect(arrayData[0][0].fileName).toEqual('node_modules/abab/README.md');
        });
    });
});
