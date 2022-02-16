# Modelos
## User
{
  "user": string,
  "password:" string,
  "photo": Photo,
  "name": string
}

## Photo
{
  "id": number,
  "photo": base64,
  "album": string,
  "name": string,
  "date": Date
}

# Esquema general
{
  "data": ...,
  "status": ...
}

{
  "data": ...   # Datos o mensaje de error
  "status": ... # Http codes
}

# Endpoints
## Login
### URL: POST /login
### Body
{
  "data": {
    "user": ...,
    "password": ...
  }
}

### Retorno

```
{
  "data": (pendiente)
  "status": http
}
```

## Registro
### URL: PUT, POST /signup

### Body
{
  "user": ...,
  "password:" ...,
  "photo": ...,
  "name": ...

}

### Retorno
{
  "data": error,
  "status": http
}

## Pantalla de inicio
### URL: GET /home/:user

### Retorno
{
  "data":{
    "user": ...,
    "name": ...,
    "photo" ...
  }
}

## Subir, editar o eliminar foto
### URL: PUT, POST, DELETE /upload

### Body
{
  "data": {
    "photo": Photo,
    "
  },
  "status": http
}

### Retorno
{
  "data": error
  "status": http
}


## Obtener álbumes
### URL: GET /albums
### Retorno
{
  "data":{
    "albums": [...]
  }
  ,
  "status": http
}

## Eliminar álbum
### URL: DELETE /album/:id
### Retorno
{
  "data": error,
  "status": http
}
