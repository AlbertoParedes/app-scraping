function getDominio(dominio) {

  var idiomas = ['en', 'es', 'ru', 'fr'];

  dominio = dominio.startsWith("http://") ? dominio.replace('http://', '') : dominio;
  dominio = dominio.startsWith("https://") ? dominio.replace('https://', '') : dominio;
  dominio = dominio.startsWith("www.") ? dominio.replace('www.', '') : dominio;


  var idioma = dominio.includes("/") ? dominio.substring(dominio.indexOf('/') + 1, dominio.length) : false;

  if (idioma && idioma.trim() !== '') {
    idioma = idioma.includes("/") ? idioma.substring(0, idioma.indexOf('/')) : idioma;
    idioma = idioma.trim().toLowerCase();
  }


  dominio = dominio.includes("/") ? dominio.substring(0, dominio.indexOf('/')) : dominio;

  if (idioma && idiomas.includes(idioma)) {
    dominio = dominio + '/' + idioma;
  }

  return dominio.trim().toLowerCase();
}

module.exports = {
  getDominio
};
