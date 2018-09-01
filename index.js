#!/usr/bin/env node 

let args = process.argv.slice(2);
//console.dir(args);
const Marked = require('marked');
const path = require('path');
const fs = require('fs'); 

const https = require('https');
const http = require('http');

let mdLinks = {};
mdLinks.getDirectoryList = (myPath, files) => {
    fs.readdirSync(myPath).forEach(function(file){
        let subpath = path.join(myPath , file);
        if(fs.lstatSync(subpath).isDirectory()){
            mdLinks.getDirectoryList(subpath, files);
        } else {
            if(file.indexOf('.md') > -1) {
                files.push(path.join(myPath,file));
            }
        }
    });
};

//valida si la direccion web y retorna su codigo de respuesta.
mdLinks.validateUrl = (link) => {
	let url = link[0].href;

	if(url.indexOf('https') > -1){
		return new Promise(function (resolve, reject){
			https.get(url, (resp) => {
			  const { statusCode } = resp;
			  if(statusCode < 400){
			      link[0].valid = 'ok ' + statusCode;
				  resolve(link);
			  }else{
			      link[0].valid = 'fail ' + statusCode;
				  resolve(link);
			  }
			}).on("error", (err) => {
				link[0].valid = 'fail ' + err.code;
				resolve(link);
			});	
		});
	}else{
		return new Promise(function (resolve, reject){
			http.get(url, (resp) => {
			  const { statusCode } = resp;
			  if(statusCode < 400){
			      link[0].valid = 'ok ' + statusCode;
				  resolve(link);
			  }else{
			      link[0].valid = 'fail ' + statusCode;
				  resolve(link);
			  }
			}).on("error", (err) => {
				link[0].valid = 'fail ' + err.code;
				resolve(link);
			});	;	
		});
	}
}

//Obtiene los archivos y directorios de un directorio recursivamente y los retorna como un array
mdLinks.getAllDirectoryContent = (myPath) => {
	return new Promise(function (resolve, reject){
        try{
            resolve(files);
        }
        catch(err){
            reject(err); 
        } 
	});
}

//Verifica si el parametro tiene algún contenido
mdLinks.verifyEntryPath = (path) => {
    if(path !== undefined){
        return true;
    }else{
        return false;
    }
};


mdLinks.convertToAbsolutePath = (ruta) => { // Convierte de inmediato la ruta relativa a absoluta... Woooo!!!!
    return path.resolve(ruta); 
}

//Lee un archivo y lo retorna.
mdLinks.leerArchivo  = (myFile) => {
	return fs.readFileSync(myFile, 'utf8');
};


//Recorta un string a un largo
mdLinks.truncate = (texto, largo)=>{
    if(texto === ''){
        return texto;
    }else{
        if (texto.length > largo)
            return texto.substring(0,largo) + '...';
        else
            return texto;
    }
}

mdLinks.markdownLinkExtractor = (markdown) => {
    //Function markdownLinkExtractor(markdown) {
      const links = [];
      const renderer = new Marked.Renderer();
      const linkWithImageSizeSupport = /^!?\[((?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|[^\[\]\\])*?)\]\(\s*(<(?:\\[<>]?|[^\s<>\\])*>|(?:\\[()]?|\([^\s\x00-\x1f()\\]*\)|[^\s\x00-\x1f()\\])*?(?:\s+=(?:[\w%]+)?x(?:[\w%]+)?)?)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/;
      Marked.InlineLexer.rules.normal.link = linkWithImageSizeSupport;
      Marked.InlineLexer.rules.gfm.link = linkWithImageSizeSupport;
      Marked.InlineLexer.rules.breaks.link = linkWithImageSizeSupport;
    
      renderer.link = function(href, title, text) {
        links.push({
          href: href,
          text: text,
          title: title,
        });
      };
      renderer.image = function(href, title, text) {
          // Remove image size at the end, e.g. ' =20%x50'
          href = href.replace(/ =\d*%?x\d*%?$/, '');
          links.push({
            href: href,
            text: text,
            title: title,
          });
      };
      Marked(markdown, {renderer: renderer});
      return links;
    };
    

//Obtiene los links de un string.
mdLinks.getLinks = (dataFile, fileName) => {

    let lineArray = dataFile.split('\n');
    let links = [];
    for(let i=0;i<lineArray.length;i++){
        let link = mdLinks.markdownLinkExtractor(lineArray[i]);
        if(link.length > 0){
            link[0]["linea"] = i;
            link[0]['fileName'] = fileName;
            link[0]['valid'] = '';
            links.push(link);
        }
    }
    return links;
}

//Obtiene todos los link de un archivo y los despliega en formato para consola.
mdLinks.getAllLinksFromFile = (filePath, option) => {
    return new Promise(function (resolve, reject){
        resolve(mdLinks.getLinks(mdLinks.leerArchivo(filePath),filePath,option));
    });
}


mdLinks.mdLinks = (path, option) =>{
	let validate = false;
    if(option !== undefined && option.validate !== undefined){
         validate = option.validate;
    }
    return new Promise(function (resolve, reject){
        if(mdLinks.verifyEntryPath(path)){
            if(fs.lstatSync(path).isDirectory()){
                let files = [];
                mdLinks.getDirectoryList(path,files);
                totalArrayResult = [];
                files.forEach(function(file){
                    totalArrayResult = totalArrayResult.concat(mdLinks.getLinks(mdLinks.leerArchivo(file),file));
                });
				if(validate === true){
					let actions = totalArrayResult.map(mdLinks.validateUrl); 
					Promise.all(actions) // pasa por el array de promesas
					.then(data => 
						resolve(data)
					);
				}else{
					resolve(totalArrayResult);
				}
				
            }else{
                mdLinks.getAllLinksFromFile(path,option)
                .then(function(links){
					if(validate === true){
						let actions = links.map(mdLinks.validateUrl); 
						Promise.all(actions) // pasa por el array de promesas
						.then(data => 
							resolve(data)
						);	
					}else{
						resolve(links);
					}					
                });
            }
        }else{
            resolve([]);
        }
    });
}

//ejecuta en modo CLI
console.log('Cargando...');
let option = {};
if(args.indexOf('--validate') > -1)
{
    option["validate"] = true;
}else{
	option["validate"] = false;
}
if (args.indexOf('--stats') > -1){
    option["stats"] = true;
}else{
    option["stats"] = false;
}
mdLinks.mdLinks(args[0],option)
.then(function(link){
    let resumen = [];
    link.forEach(function(link){
		if(option.stats === true){
			let index = resumen.findIndex(obj => obj.fileName === link[0].fileName);
			let valid = 0;
			let noValid = 0;
			if(link[0].valid.indexOf('ok') > -1){
				valid = 1;
			}else{
				noValid = 1;
			}
			if( index === -1){
				resumen.push({
					 fileName : link[0].fileName,
					 lineas   : 1,
					 valid    : valid,
					 noValid  :noValid
				});
			}else{
				resumen[index].lineas+= 1;
				resumen[index].valid += valid;
				resumen[index].noValid += noValid;
			}		
		}		
        console.log(`${link[0].fileName}:${link[0].linea} ${link[0].href} ${link[0].valid} ${link[0].text}`);
    });    
	if(option.stats === true){
        console.log('_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _');		
		console.log('Resumen:');		
		resumen.forEach(function(resumen){
			if(option.validate === true){
				console.log(`${resumen.fileName}:Lineas:${resumen.lineas}, Validas:${resumen.valid}, No Validas:${resumen.noValid}`);
			}else{
				console.log(`${resumen.fileName}:Lineas:${resumen.lineas}`);
			}
		});
	}

});

module.exports = mdLinks;