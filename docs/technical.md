# Manual Técnico
## Modelos
### User
```js
{
  "user": string,
  "password:" string,
  "photo": Photo,
  "name": string
}
```

- El usuario debe ser único.
- La contraseña debe ser encriptada.

### Photo
```js
{
  "id": number,
  "photo": string,
  "album": Album,
  "name": string,
  "date": Date
}
```
- La foto debe ser un string en base64 del lado del cliente, y un enlace a la foto en la base de datos.

### Album
```js
{
  "id": number,
  "name": string,
}
```
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
Endpoint para el inicio de sesión.

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
  "data": Photo,
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

### DELETE /album/:id
Endpoint para eliminar un álbum.

#### Retorno
```js
{
  "data": Error,
  "status"
}
```
