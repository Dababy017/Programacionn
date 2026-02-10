// carga la variables de entorno desde .env 
require('dotenv').config();

module.exports ={
    //clave para firmar tojen de jwt
    secret: proceess.env.JWT_SECRET || 
    "túsecretoparalostokens",
    //Tiempo de expiración del token en segundos
    jwtEpiration: process.env.JWT_EXPIRATION ||
    86400, //24 HORAS
        // Tiempo de expiración de refrescar token
    jwtRefresh: 6048000, // 7 días 
    //numero de rondas para encriptar la contraseña
    slatRounds: process.env.SALT_ROUNDS || 8

};