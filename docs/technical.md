# Manual Técnico
## Modelos
### User
```js
{
  "user": string,
  "password:" string,
  "photo": Photo,
  "photos": Photo[],
  "name": string
}
```

- El usuario debe ser único.
- La contraseña debe ser encriptada.

### Photo
```js
{
  "url": string,
  "photo": string,
  "tags": string[],
  "name": string,
  "description": string
}
```
- El atributo url es un enlace dentro del S3.
- El atributo photo es la imagen en base64
- La foto debe ser un string en base64 del lado del cliente, y un enlace a la foto en la base de datos.

## Token
Se utilizan Json Web Tokens para autenticar las peticiones usuario.

## Esquema general de respuesta del servidor
```js
{
  "data": any,
  "status": number
}
```
- Data se refiere a la información obtenida del servidor o un mensaje de error.
- Status es el código HTTP de la respuesta.

## Endpoints
### POST /login
Endpoint para el inicio de sesión. Se valida si se envía la contraseña del usuario o la foto para detectar el tipo de inicio de sesión.

#### Body
```js
{
  "data": User
}
```

#### Retorno
```js
{
  "data": Error,
  "status"
}
```

### GET /user
Endpoint para obtener la información del usuario.

#### Retorno
```js
{
  "data": User | Error,
  "status"
}
```

### POST /user
Endpoint para registrar un usuario.

#### Body
```js
{
  "data": User
}
```

### PUT /user
Endpoint para actualizar un usuario.

#### Body
```js
{
  "data": User
}
```

#### Retorno
```js
{
  "data": Error,
  "status"
}
```

### POST /photo
Endpoint para subir una foto.

#### Body
```js
{
  "data": Photo
}
```

#### Retorno
```js
{
  "data": Error,
  "status"
}
```

### PUT /photo/:id
Endpoint para actualizar una foto.

#### Body
```js
{
  "data": Photo,
  "status"
}
```

#### Retorno
```js
{
  "data": Photo | Error,
  "status"
}
```

### DELETE /photo/:id
Endpoint para eliminar una foto.

#### Retorno
```js
{
  "data": Error,
  "status"
}
```

### GET /album
Endpoint para obtener los álbumes del usuario.

#### Retorno
```js
{
  "data": Album[] | Error,
  "status"
}
```

### DELETE /album/:name
Endpoint para eliminar un álbum.

#### Retorno
```js
{
  "data": Error,
  "status"
}
```

### POST /text
Endpoint para reconocimiento de texto en fotos. Se envía una imagen en base64.

#### Body
```js
{
  "data": string
}
```

#### Retorno
```js
{
  "data": string | Error,
  "status"
}
```

### POST /translate
Endpoint para traducción de texto. El idioma de origen es automático y los de destino son inglés (en), español (es) y francés (fr).

#### Body
```js
{
  "data": {
    "text": string,
    "language": string
  }
}
```

#### Retorno
```js
{
  "data": string | Error,
  "status"
}
```

### POST /chat
Endpoint para utilización de chatbot.

#### Body
```js
{
  "data": string
}
```

#### Retorno
```js
{
  "data": string[] | Error,
  "status"
}
```

