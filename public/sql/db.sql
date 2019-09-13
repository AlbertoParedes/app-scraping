CREATE DATABASE yoseo_scripts;

USE yoseo_scripts;

CREATE TABLE documentos_traducciones(
  id INT(250) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  create_at TIMESTAMP NOT NULL DEFAULT current_timestamp
);

-- TRADUCCIONES TABLE
CREATE TABLE traducciones(
  id INT(250) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  url VARCHAR(1000) NOT NULL,
  hoja VARCHAR(255) NOT NULL,
  idioma_inicio VARCHAR(200) NOT NULL,
  idioma_fin VARCHAR(200) NOT NULL,
  texto TEXT,
  traduccion TEXT,
  id_documento INT(250),
  CONSTRAINT fk_id_documento FOREIGN KEY (id_documento) REFERENCES documentos_traducciones(id)
);
